import type { Agent } from '../model'
import { validateAgentLocalInvariants } from '../../utils/validateAgentInvariants'
import { floor } from '../../utils/mathUtils'
import { group } from 'radash'

export type AgentsView = Readonly<{
  getTerminated(): Agent[]
  inTransit(): Agent[]
  deployedOnMissionSite(missionSiteId: string): Agent[]
  validateAvailable(selectedAgentIds: string[]): {
    isValid: boolean
    errorMessage?: string
    nonAvailableAgents: Agent[]
  }
  validateInvariants(): void
  toArray(): readonly Agent[]
}>

export function createAgentsView(agents: readonly Agent[]): AgentsView {
  // Precompute indexes/caches *once* for this instance, e.g.
  const byAssignment = group(agents, (agent) => agent.assignment)

  const view: AgentsView = {
    getTerminated: () => agents.filter((agent) => agent.state === 'Terminated'),
    inTransit: () => agents.filter((agent) => agent.state === 'InTransit'),
    deployedOnMissionSite: (missionSiteId: string) => {
      const candidates = byAssignment[missionSiteId] ?? []
      return candidates.filter((agent) => agent.state === 'OnMission')
    },
    validateAvailable: (selectedAgentIds: string[]) => validateAvailable(agents as Agent[], selectedAgentIds),
    validateInvariants: () => agents.forEach((agent) => validateAgentLocalInvariants(agent)),
    toArray: () => agents,
  }

  return Object.freeze(view)
}

// Calculates the effective skill of an agent. Refer to about_agents.md for details.
export function getEffectiveSkill(agent: Agent): number {
  const hitPointsLost = agent.maxHitPoints - agent.hitPoints
  const hitPointsReduction = agent.maxHitPoints > 0 ? hitPointsLost / agent.maxHitPoints : 0
  const exhaustionReduction = agent.exhaustion / 100

  const result = agent.skill * (1 - hitPointsReduction) * (1 - exhaustionReduction)
  return floor(result)
}

// Validates that all selected agents are in "Available" state
export function validateAvailable(
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
