import {
  AGENT_CONTRACTING_INCOME,
  AGENT_ESPIONAGE_INTEL,
  AGENT_EXHAUSTION_INCREASE_PER_TURN,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  SUPPRESSION_DECAY_PCT,
} from '../ruleset/constants'
import { assertEqual } from '../utils/assert'
import { floor } from '../utils/mathUtils'
import { getEffectiveSkill } from './AgentService'
import type { GameState } from './model'
import { getAgentUpkeep } from './modelDerived'
import { updateDeployedMissionSite } from './updateDeployedMissionSite'

// Helper functions for turn advancement

/**
 * Updates agents in Available state - apply exhaustion recovery
 */
function updateAvailableAgents(state: GameState): void {
  for (const agent of state.agents) {
    if (agent.state === 'Available' && agent.assignment === 'Standby') {
      agent.exhaustion = Math.max(0, agent.exhaustion - AGENT_EXHAUSTION_RECOVERY_PER_TURN)
    }
  }
}

/**
 * Updates agents in Recovering state - apply hit point restoration and exhaustion recovery
 */
function updateRecoveringAgents(state: GameState): void {
  for (const agent of state.agents) {
    if (agent.state === 'Recovering') {
      // Apply exhaustion recovery
      agent.exhaustion = Math.max(0, agent.exhaustion - AGENT_EXHAUSTION_RECOVERY_PER_TURN)

      // Handle recovery countdown and hit point restoration
      if (agent.recoveryTurns > 0) {
        agent.recoveryTurns -= 1

        // Calculate total recovery turns originally needed
        const originalHitPointsLost = agent.hitPointsLostBeforeRecovery
        const totalRecoveryTurns = Math.ceil(((originalHitPointsLost / agent.maxHitPoints) * 100) / 2)

        // Calculate which turn of recovery we just completed
        const turnsCompletedSoFar = totalRecoveryTurns - agent.recoveryTurns

        // Calculate cumulative hit points to restore based on linear progression
        const hitPointsPerTurn = originalHitPointsLost / totalRecoveryTurns
        const totalHitPointsToRestoreSoFar = floor(hitPointsPerTurn * turnsCompletedSoFar)

        // Set current hit points based on cumulative restoration
        agent.hitPoints = agent.maxHitPoints - originalHitPointsLost + totalHitPointsToRestoreSoFar
      }

      if (agent.recoveryTurns <= 0) {
        assertEqual(
          agent.hitPoints,
          agent.maxHitPoints,
          'Agent hit points should be fully restored on recovery completion',
        )
        // Reset recovery state
        agent.hitPointsLostBeforeRecovery = 0
        agent.state = 'Available'
        agent.assignment = 'Standby'
      }
    }
  }
}

/**
 * Updates agents in InTransit state - apply state transitions
 */
function updateInTransitAgents(state: GameState): void {
  for (const agent of state.agents) {
    if (agent.state === 'InTransit') {
      if (agent.assignment === 'Contracting' || agent.assignment === 'Espionage') {
        agent.state = 'OnAssignment'
      } else if (agent.assignment === 'Recovery') {
        agent.state = 'Recovering'
      } else {
        agent.state = 'Available'
      }
    }
  }
}

/**
 * Updates agents on Contracting assignment - earn money and apply exhaustion
 */
function updateContractingAgents(state: GameState): { moneyEarned: number } {
  let moneyEarned = 0

  for (const agent of state.agents) {
    if (agent.state === 'OnAssignment' && agent.assignment === 'Contracting') {
      // Earn money based on effective skill
      const effectiveSkill = getEffectiveSkill(agent)
      const income = floor((AGENT_CONTRACTING_INCOME * effectiveSkill) / 100)
      moneyEarned += income

      // Apply exhaustion
      agent.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_TURN
    }
  }

  return { moneyEarned }
}

/**
 * Updates agents on Espionage assignment - gather intel and apply exhaustion
 */
function updateEspionageAgents(state: GameState): { intelGathered: number } {
  let intelGathered = 0

  for (const agent of state.agents) {
    if (agent.state === 'OnAssignment' && agent.assignment === 'Espionage') {
      // Gather intel based on effective skill
      const effectiveSkill = getEffectiveSkill(agent)
      const intel = floor((AGENT_ESPIONAGE_INTEL * effectiveSkill) / 100)
      intelGathered += intel

      // Apply exhaustion
      agent.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_TURN
    }
  }

  return { intelGathered }
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
 * Updates deployed mission sites and their agents
 */
function updateDeployedMissionSites(state: GameState): void {
  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Deployed') {
      updateDeployedMissionSite(state, missionSite)
    }
  }
}

/**
 * Updates player assets based on the results of agent assignments and mission rewards
 */
function updatePlayerAssets(state: GameState, moneyEarned: number, intelGathered: number): void {
  // Add money earned by contracting agents
  state.money += moneyEarned

  // Add intel gathered by espionage agents
  state.intel += intelGathered

  // Add funding income
  state.money += state.funding

  // KJA this is broken - currently it makes player keep upkeep for terminated agents,
  // but it should not. HOWEVER, agents terminated in given turn should still be paid for.
  // Subtract agent upkeep costs
  const agentUpkeep = getAgentUpkeep(state)
  state.money -= agentUpkeep

  // Subtract hire cost
  state.money -= state.hireCost

  // Reset hire cost
  state.hireCost = 0

  // KJA change the mission rewards application so it is instead applied in appropriate stages,
  // not in updateDeployedMissionSite
  // Mission rewards are already applied in updateDeployedMissionSite
}

/**
 * Updates panic based on faction threat levels and suppression
 */
function updatePanic(state: GameState): void {
  // Increase panic by the sum of (threat level - suppression) for all factions
  // This uses current suppression values, exactly as displayed in SituationReportCard
  const totalPanicIncrease = state.factions.reduce(
    (sum, faction) => sum + Math.max(0, faction.threatLevel - faction.suppression),
    0,
  )
  state.panic += totalPanicIncrease

  // KJA change the mission rewards application so it is instead applied in appropriate stages,
  // not in updateDeployedMissionSite
  // Mission site rewards may have already reduced panic via applyMissionRewards
}

/**
 * Updates factions - apply threat level increases and suppression decay
 */
function updateFactions(state: GameState): void {
  for (const faction of state.factions) {
    // Increment faction threat levels
    faction.threatLevel += faction.threatIncrease

    // Apply suppression decay AFTER panic calculation and threat increase
    faction.suppression = floor(faction.suppression * (1 - SUPPRESSION_DECAY_PCT / 100))
  }

  // KJA change the mission rewards application so it is instead applied in appropriate stages,
  // not in updateDeployedMissionSite
  // Mission site rewards may have already applied faction suppression/threat changes via applyMissionRewards
}

export default function advanceTurnImpl(state: GameState): void {
  state.turn += 1
  state.actionsCount = 0

  // Follow the order specified in about_turn_advancement.md:

  // 1. Update all agents in Available state
  updateAvailableAgents(state)

  // 2. Update all agents in Recovering state
  updateRecoveringAgents(state)

  // 3. Update all agents in InTransit state
  updateInTransitAgents(state)

  // 4. Update agents on Contracting assignment
  const contractingResults = updateContractingAgents(state)

  // 5. Update agents on Espionage assignment
  const espionageResults = updateEspionageAgents(state)

  // 6. Update active non-deployed mission sites
  updateActiveMissionSites(state)

  // 7. Update deployed mission sites (and agents deployed to them)
  updateDeployedMissionSites(state)

  // 8. Update player assets based on the results of the previous steps
  updatePlayerAssets(state, contractingResults.moneyEarned, espionageResults.intelGathered)

  // 9. Update panic based on the results of the previous steps
  updatePanic(state)

  // 10. Update factions based on the results of the previous steps
  updateFactions(state)
}
