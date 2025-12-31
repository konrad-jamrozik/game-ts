import type { Agent } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import { AGENT_HIRE_COST } from '../../lib/data_tables/constants'
import { getLeadIntelLoss, sumAgentEffectiveSkills } from '../../lib/ruleset/leadRuleset'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { investigatingAgents, onTrainingAssignment } from '../../lib/model_utils/agentUtils'
import type { LeadInvestigation } from '../../lib/model/leadModel'
import { bldAgent } from '../../lib/factories/agentFactory'
import { bldWeapon } from '../../lib/factories/weaponFactory'

export const hireAgent = asPlayerAction((state: GameState) => {
  const newAgent = bldAgent({
    agentCount: state.agents.length,
    turnHired: state.turn,
    weapon: bldWeapon({ damage: state.weaponDamage }),
    state: 'InTransit',
    assignment: 'Standby',
  })
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
  recallAgentsLogic(state, action.payload)
})

/**
 * Recalls agents from their current assignments (investigations, contracting, training).
 * Removes agents from lead investigations if applicable, and sets them to Standby/InTransit/Available.
 * This is the core logic that can be called from game logic or Redux actions.
 */
export function recallAgentsLogic(state: GameState, agentIdsToRecall: readonly string[]): void {
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
}
