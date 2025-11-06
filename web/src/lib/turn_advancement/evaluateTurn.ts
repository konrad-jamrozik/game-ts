import { agsV } from '../model/agents/AgentsView'
import { getMissionById } from '../collections/missions'
import type { Faction, FactionRewards, GameState, MissionRewards } from '../model/model'
import {
  newValueChange,
  type AssetsReport,
  type FactionReport,
  type IntelBreakdown,
  type MoneyBreakdown,
  type PanicReport,
  type TurnReport,
} from '../model/reportModel'
import { SUPPRESSION_DECAY_PCT } from '../model/ruleset/constants'
import { validateGameStateInvariants } from '../model/validateGameStateInvariants'
import { floor } from '../utils/mathUtils'
import { evaluateDeployedMissionSite } from './evaluateDeployedMissionSite'
import {
  updateAvailableAgents,
  updateContractingAgents,
  updateEspionageAgents,
  updateInTransitAgents,
  updateRecoveringAgents,
} from './updateAgents'

/**
 * This function is documented by the about_turn_advancement.md document.
 */
export default function evaluateTurn(state: GameState): TurnReport {
  validateGameStateInvariants(state)

  // The step and their numbers are taken from the documented describing this function.

  // 1. Update turn and actions counter

  const timestamp = Date.now()
  const turn = state.turn + 1
  state.turn = turn
  state.actionsCount = 0

  // 2. Compute agent upkeep
  const agentUpkeep = agsV(state.agents).agentUpkeep()

  // 3. Update all agents in Available state
  updateAvailableAgents(state)

  // 4. Update all agents in Recovering state
  updateRecoveringAgents(state)

  // 5. Update all agents on Contracting assignment
  const contractingResults = updateContractingAgents(state)

  // 6. Update all agents on Espionage assignment
  const espionageResults = updateEspionageAgents(state)

  // 7. Update all agents in InTransit state
  updateInTransitAgents(state)

  // 8. Update active non-deployed mission sites
  updateActiveMissionSites(state)

  // 9. Evaluate deployed mission sites (and agents deployed to them)
  const missionRewards = evaluateDeployedMissionSites(state)

  // 10. Update player assets
  const assetsReport = updatePlayerAssets(state, {
    agentUpkeep,
    moneyEarned: contractingResults.moneyEarned,
    intelGathered: espionageResults.intelGathered,
    missionRewards,
  })

  // 11. Update panic
  const panicReport = updatePanic(state, missionRewards)

  // 12. Update factions
  const factionsReport = updateFactions(state, missionRewards)

  validateGameStateInvariants(state)

  // Build and return TurnReport
  const turnReport: TurnReport = {
    timestamp,
    turn,
    assets: assetsReport,
    panic: panicReport,
    factions: factionsReport,
  }

  return turnReport
}

/**
 * Updates active non-deployed mission sites - apply expiration countdown
 */
function updateActiveMissionSites(state: GameState): void {
  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Active' && missionSite.expiresIn !== 'never') {
      missionSite.expiresIn -= 1
      if (missionSite.expiresIn <= 0) {
        missionSite.state = 'Expired'
      }
    }
  }
}

/**
 * Evaluates deployed mission sites and their agents
 * Returns collected mission rewards with site information to be applied later
 */
function evaluateDeployedMissionSites(
  state: GameState,
): { rewards: MissionRewards; missionSiteId: string; missionTitle: string }[] {
  const missionRewards: { rewards: MissionRewards; missionSiteId: string; missionTitle: string }[] = []

  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Deployed') {
      const rewards = evaluateDeployedMissionSite(state, missionSite)
      if (rewards) {
        // Get mission to access title
        const mission = getMissionById(missionSite.missionId)
        missionRewards.push({
          rewards,
          missionSiteId: missionSite.id,
          missionTitle: mission.title,
        })
      }
    }
  }

  return missionRewards
}

/**
 * Updates player assets based on the results of agent assignments and mission rewards
 * Returns detailed AssetsReport tracking all changes
 */
function updatePlayerAssets(
  state: GameState,
  income: {
    agentUpkeep: number
    moneyEarned: number
    intelGathered: number
    missionRewards: { rewards: MissionRewards; missionSiteId: string; missionTitle: string }[]
  },
): AssetsReport {
  // Capture previous values
  const previousMoney = state.money
  const previousIntel = state.intel

  // Track mission reward amounts for breakdown
  let missionMoneyRewards = 0
  let missionIntelRewards = 0

  // Subtract agent upkeep costs (calculated at turn start before any agents were terminated)
  state.money -= income.agentUpkeep

  // Add money earned by contracting agents
  state.money += income.moneyEarned

  // Add funding income
  state.money += state.funding

  // Subtract hire cost
  state.money -= state.currentTurnTotalHireCost

  // Reset hire cost
  const hireCosts = state.currentTurnTotalHireCost
  state.currentTurnTotalHireCost = 0

  // Add intel gathered by espionage agents
  state.intel += income.intelGathered

  // Apply mission rewards for money, intel, and funding only
  // Panic and faction rewards are applied in their respective update functions
  for (const { rewards } of income.missionRewards) {
    if (rewards.money !== undefined) {
      state.money += rewards.money
      missionMoneyRewards += rewards.money
    }
    if (rewards.intel !== undefined) {
      state.intel += rewards.intel
      missionIntelRewards += rewards.intel
    }
    if (rewards.funding !== undefined) {
      state.funding += rewards.funding
    }
  }

  const moneyChange = newValueChange(previousMoney, state.money)
  const intelChange = newValueChange(previousIntel, state.intel)

  // Create detailed breakdowns
  const moneyDetails: MoneyBreakdown = {
    agentUpkeep: -income.agentUpkeep,
    contractingEarnings: income.moneyEarned,
    fundingIncome: state.funding,
    hireCosts: -hireCosts,
    missionRewards: missionMoneyRewards,
  }

  const intelDetails: IntelBreakdown = {
    espionageGathered: income.intelGathered,
    missionRewards: missionIntelRewards,
  }

  return {
    moneyChange,
    intelChange,
    moneyBreakdown: moneyDetails,
    intelBreakdown: intelDetails,
  }
}

/**
 * Updates panic based on faction threat levels and suppression, and applies panic reduction from mission rewards
 * Returns detailed PanicReport tracking all changes
 */
function updatePanic(
  state: GameState,
  missionRewards: { rewards: MissionRewards; missionSiteId: string; missionTitle: string }[],
): PanicReport {
  const previousPanic = state.panic

  // Track faction contributions
  const factionContributions = state.factions.map((faction) => {
    const contribution = Math.max(0, faction.threatLevel - faction.suppression)
    return {
      factionId: faction.id,
      factionName: faction.name,
      contribution,
    }
  })

  // Increase panic by the sum of (threat level - suppression) for all factions
  const totalPanicIncrease = factionContributions.reduce((sum, faction) => sum + faction.contribution, 0)
  state.panic += totalPanicIncrease

  // Track mission reductions and apply them
  const missionReductions = []
  for (const { rewards, missionSiteId, missionTitle } of missionRewards) {
    if (rewards.panicReduction !== undefined) {
      missionReductions.push({
        missionSiteId,
        missionTitle,
        reduction: rewards.panicReduction,
      })
      state.panic = Math.max(0, state.panic - rewards.panicReduction)
    }
  }

  return {
    change: newValueChange(previousPanic, state.panic),
    breakdown: {
      factionContributions,
      missionReductions,
    },
  }
}

/**
 * Apply faction rewards to a target faction
 */
function applyFactionReward(targetFaction: Faction, factionReward: FactionRewards): void {
  if (factionReward.threatReduction !== undefined) {
    targetFaction.threatLevel = Math.max(0, targetFaction.threatLevel - factionReward.threatReduction)
  }
  if (factionReward.suppression !== undefined) {
    targetFaction.suppression += factionReward.suppression
  }
}

/**
 * Updates factions - apply threat level increases and suppression decay, and applies faction rewards from missions
 * Returns detailed FactionReport[] tracking all changes
 */
function updateFactions(
  state: GameState,
  missionRewards: { rewards: MissionRewards; missionSiteId: string; missionTitle: string }[],
): FactionReport[] {
  const factionReports: FactionReport[] = []

  for (const faction of state.factions) {
    // Capture previous values
    const previousThreatLevel = faction.threatLevel
    const previousThreatIncrease = faction.threatIncrease
    const previousSuppression = faction.suppression

    // Increment faction threat levels
    faction.threatLevel += faction.threatIncrease

    // Apply suppression decay AFTER panic calculation and threat increase
    faction.suppression = floor(faction.suppression * (1 - SUPPRESSION_DECAY_PCT / 100))
    const suppressionDecay = previousSuppression - faction.suppression

    // Track mission impacts on this faction
    const missionImpacts = []
    for (const { rewards, missionSiteId, missionTitle } of missionRewards) {
      if (rewards.factionRewards) {
        for (const factionReward of rewards.factionRewards) {
          if (factionReward.factionId === faction.id) {
            const impact: {
              missionSiteId: string
              missionTitle: string
              threatReduction?: number
              suppressionAdded?: number
            } = {
              missionSiteId,
              missionTitle,
            }

            if (factionReward.threatReduction !== undefined) {
              impact.threatReduction = factionReward.threatReduction
            }
            if (factionReward.suppression !== undefined) {
              impact.suppressionAdded = factionReward.suppression
            }

            missionImpacts.push(impact)
            applyFactionReward(faction, factionReward)
          }
        }
      }
    }

    // Check if faction is discovered by verifying all discovery prerequisites are met
    const isDiscovered = faction.discoveryPrerequisite.every(
      (leadId) => (state.leadInvestigationCounts[leadId] ?? 0) > 0,
    )

    // Create faction report
    factionReports.push({
      factionId: faction.id,
      factionName: faction.name,
      isDiscovered,
      threatLevel: newValueChange(previousThreatLevel, faction.threatLevel),
      threatIncrease: newValueChange(previousThreatIncrease, faction.threatIncrease),
      suppression: newValueChange(previousSuppression, faction.suppression),
      details: {
        baseThreatIncrease: faction.threatIncrease,
        missionImpacts,
        suppressionDecay,
      },
    })
  }

  return factionReports
}
