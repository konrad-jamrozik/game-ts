import { agsV } from '../model/agents/AgentsView'
import { getMissionById } from '../collections/missions'
import { bps } from '../model/bps'
import type { Faction, FactionRewards, GameState, MissionRewards } from '../model/model'
import {
  newValueChange,
  type AssetsReport,
  type AgentsReport,
  type FactionReport,
  type IntelBreakdown,
  type MoneyBreakdown,
  type PanicReport,
  type TurnReport,
} from '../model/turnReportModel'
import { validateGameStateInvariants } from '../model/validateGameStateInvariants'
import { calculatePanicIncrease, decaySuppression } from '../model/ruleset/ruleset'
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

  // Capture agent counts before turn advancement
  const previousAgentCounts = getAgentCounts(state.agents)

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
  const missionResults = evaluateDeployedMissionSites(state)
  const missionRewards = missionResults.rewards
  const agentsWoundedFromMissions = missionResults.agentsWounded
  const agentsUnscathedFromMissions = missionResults.agentsUnscathed

  // 10. Update player assets
  const assetsReportPartial = updatePlayerAssets(state, {
    agentUpkeep,
    moneyEarned: contractingResults.moneyEarned,
    intelGathered: espionageResults.intelGathered,
    missionRewards,
  })

  // 11. Get agents report
  const agentsReport = getAgentsReport(
    state,
    previousAgentCounts,
    agentsWoundedFromMissions,
    agentsUnscathedFromMissions,
  )

  // Combine assets and agents reports
  const assetsReport: AssetsReport = {
    ...assetsReportPartial,
    agentsReport,
  }

  // 12. Update panic
  const panicReport = updatePanic(state, missionRewards)

  // 13. Update factions
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
 * Count agents by state and assignment
 */
function getAgentCounts(agents: GameState['agents']): {
  total: number
  available: number
  inTransit: number
  standby: number
  recovering: number
  wounded: number
  terminated: number
} {
  return {
    total: agents.filter((agent) => agent.state !== 'Terminated').length,
    available: agents.filter((agent) => agent.state === 'Available').length,
    inTransit: agents.filter((agent) => agent.state === 'InTransit').length,
    standby: agents.filter((agent) => agent.assignment === 'Standby').length,
    recovering: agents.filter((agent) => agent.state === 'Recovering').length,
    wounded: agents.filter((agent) => agent.state === 'Recovering').length,
    terminated: agents.filter((agent) => agent.state === 'Terminated').length,
  }
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
 * Returns collected mission rewards with site information and count of agents wounded
 */
function evaluateDeployedMissionSites(state: GameState): {
  rewards: { rewards: MissionRewards; missionSiteId: string; missionTitle: string }[]
  agentsWounded: number
  agentsUnscathed: number
} {
  const missionRewards: { rewards: MissionRewards; missionSiteId: string; missionTitle: string }[] = []
  let agentsWounded = 0
  let agentsUnscathed = 0

  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Deployed') {
      const result = evaluateDeployedMissionSite(state, missionSite)
      if (result.rewards) {
        // Get mission to access title
        const mission = getMissionById(missionSite.missionId)
        missionRewards.push({
          rewards: result.rewards,
          missionSiteId: missionSite.id,
          missionTitle: mission.title,
        })
      }
      agentsWounded += result.agentsWounded
      agentsUnscathed += result.agentsUnscathed
    }
  }

  return { rewards: missionRewards, agentsWounded, agentsUnscathed }
}

/**
 * Updates player assets based on the results of agent assignments and mission rewards
 * Returns partial AssetsReport without agentsReport (money, intel, and breakdowns only)
 */
function updatePlayerAssets(
  state: GameState,
  income: {
    agentUpkeep: number
    moneyEarned: number
    intelGathered: number
    missionRewards: { rewards: MissionRewards; missionSiteId: string; missionTitle: string }[]
  },
): Omit<AssetsReport, 'agentsReport'> {
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
 * Updates agent counts and returns AgentsReport tracking all changes
 */
function getAgentsReport(
  state: GameState,
  previousAgentCounts: {
    total: number
    available: number
    inTransit: number
    standby: number
    recovering: number
    wounded: number
    terminated: number
  },
  agentsWoundedFromMissions: number,
  agentsUnscathedFromMissions: number,
): AgentsReport {
  // Capture agent counts after turn advancement
  const currentAgentCounts = getAgentCounts(state.agents)

  // Calculate wounded counts: wounded should only increase from missions, not decrease from recovery
  // Previous wounded = 0 (we track delta only, reset each turn)
  // Current wounded = agents wounded from missions this turn
  // Delta = agents wounded from missions this turn
  const previousWounded = 0
  const currentWounded = agentsWoundedFromMissions

  // Calculate unscathed counts: unscathed should only increase from missions, not decrease
  // Previous unscathed = 0 (we track delta only, reset each turn)
  // Current unscathed = agents unscathed from missions this turn
  // Delta = agents unscathed from missions this turn
  const previousUnscathed = 0
  const currentUnscathed = agentsUnscathedFromMissions

  return {
    total: newValueChange(previousAgentCounts.total, currentAgentCounts.total),
    available: newValueChange(previousAgentCounts.available, currentAgentCounts.available),
    inTransit: newValueChange(previousAgentCounts.inTransit, currentAgentCounts.inTransit),
    standby: newValueChange(previousAgentCounts.standby, currentAgentCounts.standby),
    recovering: newValueChange(previousAgentCounts.recovering, currentAgentCounts.recovering),
    wounded: newValueChange(previousWounded, currentWounded),
    unscathed: newValueChange(previousUnscathed, currentUnscathed),
    terminated: newValueChange(previousAgentCounts.terminated, currentAgentCounts.terminated),
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
  const factionPanicIncreases = state.factions.map((faction) => {
    const factionPanicIncrease = calculatePanicIncrease(faction.threatLevel, faction.suppression)
    return {
      factionId: faction.id,
      factionName: faction.name,
      factionPanicIncrease,
    }
  })

  // Increase panic by the sum of (threat level - suppression) for all factions
  let totalPanicIncrease = 0
  for (const faction of factionPanicIncreases) {
    totalPanicIncrease += faction.factionPanicIncrease.value
  }
  state.panic = bps(state.panic.value + totalPanicIncrease)

  // Track mission reductions and apply them
  const missionReductions = []
  for (const { rewards, missionSiteId, missionTitle } of missionRewards) {
    if (rewards.panicReduction !== undefined) {
      missionReductions.push({
        missionSiteId,
        missionTitle,
        reduction: rewards.panicReduction,
      })
      state.panic = bps(Math.max(0, state.panic.value - rewards.panicReduction.value))
    }
  }

  return {
    change: newValueChange(previousPanic, state.panic),
    breakdown: {
      factionPanicIncreases,
      missionReductions,
    },
  }
}

/**
 * Apply faction rewards to a target faction
 */
function applyFactionReward(targetFaction: Faction, factionReward: FactionRewards): void {
  if (factionReward.threatReduction !== undefined) {
    targetFaction.threatLevel = bps(Math.max(0, targetFaction.threatLevel.value - factionReward.threatReduction.value))
  }
  if (factionReward.suppression !== undefined) {
    targetFaction.suppression = bps(targetFaction.suppression.value + factionReward.suppression.value)
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
    faction.threatLevel = bps(faction.threatLevel.value + faction.threatIncrease.value)

    // Apply suppression decay AFTER panic calculation and threat increase
    faction.suppression = decaySuppression(faction.suppression)
    const suppressionDecay = bps(previousSuppression.value - faction.suppression.value)

    // Track mission impacts on this faction
    const missionImpacts = []
    for (const { rewards, missionSiteId, missionTitle } of missionRewards) {
      if (rewards.factionRewards) {
        for (const factionReward of rewards.factionRewards) {
          if (factionReward.factionId === faction.id) {
            const impact: {
              missionSiteId: string
              missionTitle: string
              threatReduction?: typeof factionReward.threatReduction
              suppressionAdded?: typeof factionReward.suppression
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
      baseThreatIncrease: faction.threatIncrease,
      missionImpacts,
      suppressionDecay,
    })
  }

  return factionReports
}
