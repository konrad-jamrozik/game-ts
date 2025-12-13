import type { Agent } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import {
  AGENT_HIRE_COST,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_SKILL,
} from '../../lib/ruleset/constants'
import { toF6 } from '../../lib/primitives/fixed6'
import { newWeapon } from '../../lib/ruleset/weaponRuleset'
import { getLeadIntelLoss, sumAgentEffectiveSkills } from '../../lib/ruleset/leadRuleset'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { formatAgentId } from '../reducer_utils/agentIdUtils'
import { investigatingAgents, onTrainingAssignment } from '../../lib/model_utils/agentUtils'
import type { LeadInvestigation } from '../../lib/model/model'

export const hireAgent = asPlayerAction((state: GameState) => {
  const nextAgentNumericId = state.agents.length
  const newAgentId = formatAgentId(nextAgentNumericId)

  const newAgent = newHiredAgent(newAgentId, state.turn, state.weaponDamage)
  state.agents.push(newAgent)
  state.money -= AGENT_HIRE_COST
})

export const sackAgents = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToSack = action.payload
  for (const agent of state.agents) {
    if (agentIdsToSack.includes(agent.id)) {
      agent.state = 'Sacked'
      agent.assignment = 'Sacked'
      agent.turnTerminated = state.turn
    }
  }
})

export const assignAgentsToContracting = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToAssign = action.payload
  for (const agent of state.agents) {
    if (agentIdsToAssign.includes(agent.id)) {
      agent.assignment = 'Contracting'
      agent.state = 'InTransit'
    }
  }
})

export const assignAgentsToTraining = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToAssign = action.payload
  for (const agent of state.agents) {
    if (agentIdsToAssign.includes(agent.id)) {
      agent.assignment = 'Training'
      agent.state = 'InTraining'
    }
  }
})

/**
 * Removes agents from an investigation and applies proportional intel loss.
 * Marks investigation as Abandoned if all agents are removed.
 * Returns the old and new skill sums for tracking purposes.
 */
export function removeAgentsFromInvestigation(
  state: GameState,
  investigation: LeadInvestigation,
  agentIdsToRemove: readonly string[],
): { oldSkillSum: number; newSkillSum: number } {
  // Calculate old skill sum before removing agents
  const oldAgents = investigatingAgents(state.agents, investigation)
  const oldSkillSum = sumAgentEffectiveSkills(oldAgents)

  // Remove agents from investigation
  investigation.agentIds = investigation.agentIds.filter((id) => !agentIdsToRemove.includes(id))

  // Calculate new skill sum after removing agents
  const newAgents = investigatingAgents(state.agents, investigation)
  const newSkillSum = sumAgentEffectiveSkills(newAgents)

  // Apply proportional intel loss
  if (oldSkillSum > newSkillSum) {
    const intelLoss = getLeadIntelLoss(investigation.accumulatedIntel, oldSkillSum, newSkillSum)
    investigation.accumulatedIntel = Math.max(0, investigation.accumulatedIntel - intelLoss)
  }

  // If all agents are removed, mark investigation as Abandoned
  if (investigation.agentIds.length === 0) {
    investigation.state = 'Abandoned'
  }

  return { oldSkillSum, newSkillSum }
}

export const recallAgents = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToRecall = action.payload

  for (const agent of state.agents) {
    if (agentIdsToRecall.includes(agent.id)) {
      // Check if agent is assigned to a lead investigation
      const isLeadInvestigation = typeof agent.assignment === 'string' && agent.assignment.startsWith('investigation-')
      if (isLeadInvestigation) {
        const investigationId = agent.assignment
        const investigation = state.leadInvestigations[investigationId]
        if (investigation !== undefined) {
          // Remove agent from investigation and apply proportional loss
          removeAgentsFromInvestigation(state, investigation, [agent.id])
        }
      }
      // Check if agent is in training before changing assignment
      const trainingAgents: Agent[] = onTrainingAssignment([agent])
      const isTraining = trainingAgents.length > 0
      agent.assignment = 'Standby'
      // Training agents go directly to Available (no transit needed)
      if (isTraining) {
        agent.state = 'Available'
      } else {
        // Other assignments (Contracting, Lead Investigation) go to InTransit
        agent.state = 'InTransit'
      }
    }
  }
})

/**
 * Creates a new hired agent with the standard initial values used in the hiring process.
 */
export function newHiredAgent(id: string, turnHired: number, weaponDamage: number): Agent {
  return {
    id,
    turnHired,
    state: 'InTransit',
    assignment: 'Standby',
    skill: AGENT_INITIAL_SKILL,
    exhaustion: AGENT_INITIAL_EXHAUSTION,
    hitPoints: toF6(AGENT_INITIAL_HIT_POINTS),
    maxHitPoints: AGENT_INITIAL_HIT_POINTS,
    hitPointsLostBeforeRecovery: toF6(0),
    missionsTotal: 0,
    skillFromTraining: toF6(0),
    weapon: newWeapon(weaponDamage),
  }
}
