import { SUPPRESSION_DECAY_PCT } from '../model/ruleset/constants'
import { floor } from '../utils/mathUtils'
import {
  updateAvailableAgents,
  updateRecoveringAgents,
  updateInTransitAgents,
  updateContractingAgents,
  updateEspionageAgents,
} from './advanceTurnAgentUpdates'
import type { GameState, MissionRewards, Faction, FactionRewards } from '../model/model'
import { evaluateDeployedMissionSite } from './evaluateDeployedMissionSite'
import { agsV } from '../model/agents/AgentsView'
import { validateGameStateInvariants } from '../model/validateGameStateInvariants'
import { assertDefined } from '../utils/assert'

export default function advanceTurnImpl(state: GameState): void {
  validateGameStateInvariants(state)

  state.turn += 1
  state.actionsCount = 0

  // Calculate agent upkeep at the start of the turn, before any agents can be terminated
  const agentUpkeep = agsV(state.agents).agentUpkeep()

  // Follow the order specified in about_turn_advancement.md:

  // 1. Update all agents in Available state
  updateAvailableAgents(state)

  // 2. Update all agents in Recovering state
  updateRecoveringAgents(state)

  // 3. Update agents on Contracting assignment
  const contractingResults = updateContractingAgents(state)

  // 4. Update agents on Espionage assignment
  const espionageResults = updateEspionageAgents(state)

  // 5. Update all agents in InTransit state
  updateInTransitAgents(state)

  // 6. Update active non-deployed mission sites
  updateActiveMissionSites(state)

  // 7. Evaluate deployed mission sites (and agents deployed to them)
  const missionRewards = evaluateDeployedMissionSites(state)

  // 8. Update player assets based on the results of the previous steps
  updatePlayerAssets(state, {
    agentUpkeep,
    moneyEarned: contractingResults.moneyEarned,
    intelGathered: espionageResults.intelGathered,
    missionRewards,
  })

  // 9. Update panic based on the results of the previous steps
  updatePanic(state, missionRewards)

  // 10. Update factions based on the results of the previous steps
  updateFactions(state, missionRewards)

  validateGameStateInvariants(state)
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
 * Returns collected mission rewards to be applied later
 */
function evaluateDeployedMissionSites(state: GameState): MissionRewards[] {
  const missionRewards: MissionRewards[] = []

  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Deployed') {
      const rewards = evaluateDeployedMissionSite(state, missionSite)
      if (rewards) {
        missionRewards.push(rewards)
      }
    }
  }

  return missionRewards
}

/**
 * Updates player assets based on the results of agent assignments and mission rewards
 */
function updatePlayerAssets(
  state: GameState,
  income: { agentUpkeep: number; moneyEarned: number; intelGathered: number; missionRewards: MissionRewards[] },
): void {
  // Subtract agent upkeep costs (calculated at turn start before any agents were terminated)
  state.money -= income.agentUpkeep

  // Add money earned by contracting agents
  state.money += income.moneyEarned

  // Add funding income
  state.money += state.funding

  // Subtract hire cost
  state.money -= state.currentTurnTotalHireCost

  // Reset hire cost
  state.currentTurnTotalHireCost = 0

  // Add intel gathered by espionage agents
  state.intel += income.intelGathered

  // Apply mission rewards for money, intel, and funding only
  // Panic and faction rewards are applied in their respective update functions
  for (const rewards of income.missionRewards) {
    if (rewards.money !== undefined) {
      state.money += rewards.money
    }
    if (rewards.intel !== undefined) {
      state.intel += rewards.intel
    }
    if (rewards.funding !== undefined) {
      state.funding += rewards.funding
    }
  }
}

/**
 * Updates panic based on faction threat levels and suppression, and applies panic reduction from mission rewards
 */
function updatePanic(state: GameState, missionRewards: MissionRewards[]): void {
  // Increase panic by the sum of (threat level - suppression) for all factions
  // This uses current suppression values, exactly as displayed in SituationReportCard
  const totalPanicIncrease = state.factions.reduce(
    (sum, faction) => sum + Math.max(0, faction.threatLevel - faction.suppression),
    0,
  )
  state.panic += totalPanicIncrease

  // Apply panic reduction from mission rewards
  for (const rewards of missionRewards) {
    if (rewards.panicReduction !== undefined) {
      state.panic = Math.max(0, state.panic - rewards.panicReduction)
    }
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
 */
function updateFactions(state: GameState, missionRewards: MissionRewards[]): void {
  for (const faction of state.factions) {
    // Increment faction threat levels
    faction.threatLevel += faction.threatIncrease

    // Apply suppression decay AFTER panic calculation and threat increase
    faction.suppression = floor(faction.suppression * (1 - SUPPRESSION_DECAY_PCT / 100))
  }

  // Apply faction rewards from mission rewards
  for (const rewards of missionRewards) {
    if (rewards.factionRewards) {
      for (const factionReward of rewards.factionRewards) {
        const targetFaction = state.factions.find((faction) => faction.id === factionReward.factionId)
        assertDefined(targetFaction)
        applyFactionReward(targetFaction, factionReward)
      }
    }
  }
}
