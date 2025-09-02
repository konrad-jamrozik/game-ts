import { AGENT_EXHAUSTION_INCREASE_PER_TURN, AGENT_EXHAUSTION_RECOVERY_PER_TURN } from '../model/ruleset/constants'
import { assertEqual } from '../utils/assert'
import { floor, div } from '../utils/mathUtils'
import type { GameState } from '../model/model'
import { agsV } from '../model/agents/AgentsView'

/**
 * Updates agents in Available state - apply exhaustion recovery
 */
export function updateAvailableAgents(state: GameState): void {
  const agents = agsV(state.agents)
  agents.available().applyExhaustion(-AGENT_EXHAUSTION_RECOVERY_PER_TURN)
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
        const totalRecoveryTurns = Math.ceil((div(originalHitPointsLost, agent.maxHitPoints) * 100) / 2)

        // Calculate which turn of recovery we just completed
        const turnsCompletedSoFar = totalRecoveryTurns - agent.recoveryTurns

        // Calculate cumulative hit points to restore based on linear progression
        const hitPointsPerTurn = div(originalHitPointsLost, totalRecoveryTurns)
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

export function updateContractingAgents(state: GameState): { moneyEarned: number } {
  const agents = agsV(state.agents)
  const moneyEarned = agents.contractingIncome()
  agents.onContractingAssignment().applyExhaustion(AGENT_EXHAUSTION_INCREASE_PER_TURN)
  return { moneyEarned }
}

export function updateEspionageAgents(state: GameState): { intelGathered: number } {
  const agents = agsV(state.agents)
  const intelGathered = agents.espionageIntel()
  agents.onEspionageAssignment().applyExhaustion(AGENT_EXHAUSTION_INCREASE_PER_TURN)
  return { intelGathered }
}

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
