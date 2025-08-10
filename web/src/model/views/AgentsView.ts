import { validateAgentLocalInvariants } from '../../utils/validateAgentInvariants'
import type { Agent } from '../model'
import { agV, type AgentView } from './AgentView'

// Possible future work: rename AgentsView to Agents, AgentView, to Agent, and current Agent to AgentModel
export type AgentsView = readonly AgentView[] &
  Readonly<{
    getTerminated(): AgentsView
    inTransit(): AgentsView
    deployedOnMissionSite(missionSiteId: string): AgentsView
    validateAvailable(selectedAgentIds: string[]): Readonly<{
      isValid: boolean
      errorMessage?: string
      nonAvailableAgents: readonly Agent[]
    }>
    validateInvariants(): void
  }>

export function agsV(agents: Agent[]): AgentsView {
  const agentViews: AgentView[] = agents.map((agent) => agV(agent))

  // Map view -> underlying agent for internal predicates that require raw state
  const viewToAgent = new WeakMap<AgentView, Agent>()
  agents.forEach((agent, agentIndex) => {
    const correspondingAgentView = agentViews[agentIndex]
    if (correspondingAgentView !== undefined) {
      viewToAgent.set(correspondingAgentView, agent)
    }
  })

  function fromAgentViewArray(views: AgentView[]): AgentsView {
    // Create an array-like instance and augment with chainable helpers
    const agentViewArray: AgentView[] = [...views]
    const augmented = Object.assign(agentViewArray, {
      getTerminated: (): AgentsView =>
        fromAgentViewArray(agentViewArray.filter((agentView) => agentView.isTerminated())),
      inTransit: (): AgentsView => fromAgentViewArray(agentViewArray.filter((agentView) => agentView.isInTransit())),
      deployedOnMissionSite: (missionSiteId: string): AgentsView =>
        fromAgentViewArray(
          agentViewArray.filter((agentView) => {
            const underlyingAgent = viewToAgent.get(agentView)
            return (
              underlyingAgent !== undefined &&
              underlyingAgent.assignment === missionSiteId &&
              underlyingAgent.state === 'OnMission'
            )
          }),
        ),
      validateAvailable: (selectedAgentIds: string[]) => Object.freeze(validateAvailable(agents, selectedAgentIds)),
      validateInvariants: (): void => {
        agentViewArray.forEach((agentView) => {
          const underlyingAgent = viewToAgent.get(agentView)
          if (underlyingAgent !== undefined) {
            validateAgentLocalInvariants(underlyingAgent)
          }
        })
      },
    })

    return Object.freeze(augmented) as AgentsView
  }

  return fromAgentViewArray(agentViews)
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
