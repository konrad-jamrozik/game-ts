import {
  AGENT_CONTRACTING_INCOME,
  AGENT_ESPIONAGE_INTEL,
  AGENT_EXHAUSTION_INCREASE_PER_TURN,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
} from '../ruleset/constants'
import { assertEqual } from '../utils/assert'
import { floor } from '../utils/mathUtils'
import { getEffectiveSkill } from './views/AgentViews'
import type { GameState } from './model'

/**
 * Updates agents in Available state - apply exhaustion recovery
 */
export function updateAvailableAgents(state: GameState): void {
  for (const agent of state.agents) {
    if (agent.state === 'Available' && agent.assignment === 'Standby') {
      agent.exhaustion = Math.max(0, agent.exhaustion - AGENT_EXHAUSTION_RECOVERY_PER_TURN)
    }
  }
}

/**
 * Updates agents in Recovering state - apply hit point restoration and exhaustion recovery
 */
export function updateRecoveringAgents(state: GameState): void {
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
export function updateInTransitAgents(state: GameState): void {
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
export function updateContractingAgents(state: GameState): { moneyEarned: number } {
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
export function updateEspionageAgents(state: GameState): { intelGathered: number } {
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
