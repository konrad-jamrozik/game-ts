import type { Agent } from './model'

// 🚧 KJA migrate all service classes to the Agent(s)View model. Note I also have modelDerived.ts.

/**
 * Gets agents by their IDs
 */
// 🚧 KJA actually use this function
export function getAgentsByIds(agents: Agent[], agentIds: string[]): Agent[] {
  return agents.filter((agent) => agentIds.includes(agent.id))
}

/**
 * Checks if agent can be assigned to a specific task
 */
// 🚧KJA actually use this function. Make it delegate to validateAvailableAgents
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
