import { floor } from '../utils/mathUtils'
import type { Agent } from './model'

// KJA domain classes instead of *Service classes. E.g. Agent or Agents.
//  Note I also have modelDerived.ts. Note I will have to rename existing "type Agent" to e.g. "type AgentType".
/**
 * Domain service for agent-related operations and validations
 */

/**
 * Calculates the effective skill of an agent. Refer to about_agents.md for details.
 */
export function getEffectiveSkill(agent: Agent): number {
  const hitPointsLost = agent.maxHitPoints - agent.hitPoints
  const hitPointsReduction = agent.maxHitPoints > 0 ? hitPointsLost / agent.maxHitPoints : 0
  const exhaustionReduction = agent.exhaustion / 100

  const result = agent.skill * (1 - hitPointsReduction) * (1 - exhaustionReduction)
  return floor(result)
}

/**
 * Validates that all selected agents are in "Available" state
 */
export function validateAvailableAgents(
  agents: Agent[],
  selectedAgentIds: string[],
): {
  isValid: boolean
  errorMessage?: string
  nonAvailableAgents: Agent[]
} {
  if (selectedAgentIds.length === 0) {
    return {
      isValid: false,
      errorMessage: 'No agents selected!',
      nonAvailableAgents: [],
    }
  }

  const selectedAgents = agents.filter((agent) => selectedAgentIds.includes(agent.id))
  const nonAvailableAgents = selectedAgents.filter((agent) => agent.state !== 'Available')

  if (nonAvailableAgents.length > 0) {
    return {
      isValid: false,
      errorMessage: 'This action can be done only on available agents!',
      nonAvailableAgents,
    }
  }

  return {
    isValid: true,
    nonAvailableAgents: [],
  }
}

/**
 * Gets agents by their IDs
 */
// KJA actually use this function
export function getAgentsByIds(agents: Agent[], agentIds: string[]): Agent[] {
  return agents.filter((agent) => agentIds.includes(agent.id))
}

/**
 * Checks if agent can be assigned to a specific task
 */
// KJA actually use this function. Make it delegate to validateAvailableAgents
export function canAssignAgent(agent: Agent, taskType: 'Contracting' | 'Espionage' | 'Mission'): boolean {
  if (agent.state === 'Terminated') {
    return false
  }
  if (agent.state === 'Recovering') {
    return false
  }

  switch (taskType) {
    case 'Contracting':
    case 'Espionage': {
      return agent.state === 'Available'
    }
    case 'Mission': {
      return agent.state === 'Available'
    }
    default: {
      return false
    }
  }
}

/**
 * Formats agent count with proper pluralization // KJA move formatAgentCount back to formatUtils
 */
export function formatAgentCount(count: number): string {
  const plural = count === 0 || count > 1 ? 's' : ''
  return `${count} agent${plural}`
}
