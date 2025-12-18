import { AGENT_EXHAUSTION_INCREASE_PER_TURN } from '../../dataTables/constants'
import { toF6, floorToF6, f6add, f6min, f6lt, f6eq, toF } from '../../primitives/fixed6'
import type { GameState } from '../../model/gameStateModel'
import {
  addSkill,
  addSkillFromTraining,
  available,
  onContractingAssignment,
  onTrainingAssignment,
  applyExhaustion,
} from '../../model_utils/agentUtils'
import { getContractingIncome } from '../../ruleset/moneyRuleset'

/**
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
      agent.exhaustionPct = Math.max(0, agent.exhaustionPct - state.exhaustionRecovery)

      const maxHitPointsF6 = toF6(agent.maxHitPoints)
      const isRecovering = f6lt(agent.hitPoints, maxHitPointsF6)

      if (isRecovering) {
        // Calculate recovery per turn: maxHitPoints * recoveryPct / 100, rounded down to 6 decimal places
        const recoveryPctDecimal = toF(state.hitPointsRecoveryPct) / 100
        const recoveryPerTurn = floorToF6(agent.maxHitPoints * recoveryPctDecimal)

        // Add recovered hit points
        agent.hitPoints = f6add(agent.hitPoints, recoveryPerTurn)

        // Cap hit points at maxHitPoints
        agent.hitPoints = f6min(agent.hitPoints, maxHitPointsF6)
      }

      // Check if recovery is complete
      if (f6eq(agent.hitPoints, maxHitPointsF6)) {
        // Reset recovery state
        agent.hitPointsLostBeforeRecovery = toF6(0)
        agent.state = 'Available'
        agent.assignment = 'Standby'
      }
    }
  }
}

export function updateContractingAgents(state: GameState): { moneyEarned: number } {
  const moneyEarned = getContractingIncome(state)
  const contractingAgents = onContractingAssignment(state.agents)
  applyExhaustion(contractingAgents, AGENT_EXHAUSTION_INCREASE_PER_TURN)
  return { moneyEarned }
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
      if (agent.assignment === 'Contracting') {
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
