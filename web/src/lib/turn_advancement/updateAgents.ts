import { AGENT_EXHAUSTION_INCREASE_PER_TURN } from '../ruleset/constants'
import { assertEqual } from '../primitives/assertPrimitives'
import { floor, div, ceil } from '../primitives/mathPrimitives'
import type { GameState } from '../model/gameStateModel'
import {
  addSkill,
  addSkillFromTraining,
  available,
  onContractingAssignment,
  onEspionageAssignment,
  onTrainingAssignment,
  applyExhaustion,
} from '../model_utils/agentUtils'
import { getContractingIncomeV2 } from '../ruleset/moneyRuleset'
import { getEspionageIntelV2 } from '../ruleset/intelRuleset'

/** // KJA there should be ruleset call somewhere here, but there isn't
 * Updates agents in Available state - apply exhaustion recovery
 */
export function updateAvailableAgents(state: GameState): void {
  const availableAgents = available(state.agents)
  applyExhaustion(availableAgents, -state.exhaustionRecovery)
}

/**
 * Updates agents in Recovering state - apply hit point restoration and exhaustion recovery
 */
export function updateRecoveringAgents(state: GameState): void {
  for (const agent of state.agents) {
    if (agent.state === 'Recovering') {
      // Apply exhaustion recovery
      agent.exhaustion = Math.max(0, agent.exhaustion - state.exhaustionRecovery)

      // Handle recovery countdown and hit point restoration
      if (agent.recoveryTurns > 0) {
        agent.recoveryTurns -= 1

        // Calculate total recovery turns originally needed
        const originalHitPointsLost = agent.hitPointsLostBeforeRecovery
        const totalRecoveryTurns = ceil(
          (div(originalHitPointsLost, agent.maxHitPoints) * 100) / state.hitPointsRecoveryPct,
        )

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
  const moneyEarned = getContractingIncomeV2(state)
  const contractingAgents = onContractingAssignment(state.agents)
  applyExhaustion(contractingAgents, AGENT_EXHAUSTION_INCREASE_PER_TURN)
  return { moneyEarned }
}

export function updateEspionageAgents(state: GameState): { intelGathered: number } {
  const intelGathered = getEspionageIntelV2(state)
  const espionageAgents = onEspionageAssignment(state.agents)
  applyExhaustion(espionageAgents, AGENT_EXHAUSTION_INCREASE_PER_TURN)
  return { intelGathered }
}

export function updateTrainingAgents(state: GameState): void {
  const trainingAgents = onTrainingAssignment(state.agents)
  // Increase both skill and skillFromTraining by trainingSkillGain for each agent
  for (const agent of trainingAgents) {
    addSkill(agent, state.trainingSkillGain)
    addSkillFromTraining(agent, state.trainingSkillGain)
  }
  // Increase exhaustion by 1 for each training agent
  applyExhaustion(trainingAgents, AGENT_EXHAUSTION_INCREASE_PER_TURN)
}

export function updateInTransitAgents(state: GameState): void {
  for (const agent of state.agents) {
    if (agent.state === 'InTransit') {
      if (agent.assignment === 'Contracting' || agent.assignment === 'Espionage') {
        agent.state = 'OnAssignment'
      } else if (agent.assignment === 'Recovery') {
        agent.state = 'Recovering'
      } else if (typeof agent.assignment === 'string' && agent.assignment.startsWith('investigation-')) {
        // Agents assigned to lead investigation transition to OnAssignment
        agent.state = 'OnAssignment'
      } else {
        agent.state = 'Available'
      }
    }
    if (agent.state === 'StartingTransit') {
      agent.state = 'InTransit'
    }
  }
}
