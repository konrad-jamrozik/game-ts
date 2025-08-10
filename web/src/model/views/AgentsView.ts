import { validateAgentLocalInvariants } from '../../utils/validateAgentInvariants'
import type { Agent } from '../model'
import { agV, type AgentView } from './AgentView'
import { validateAvailableAgents, type ValidateAvailableAgentsResult } from './validateAvailableAgents'

// Possible future work: rename AgentsView to Agents, AgentView, to Agent, and current Agent to AgentModel
export type AgentsView = readonly AgentView[] &
  Readonly<{
    withIds(ids: readonly string[]): AgentsView
    notAvailable(): AgentsView
    getTerminated(): AgentsView
    inTransit(): AgentsView
    deployedOnMissionSite(missionSiteId: string): AgentsView
    validateAvailable(selectedAgentIds: string[]): ValidateAvailableAgentsResult
    validateInvariants(): void
    toArray(): Agent[]
  }>

export function agsV(agents: Agent[]): AgentsView {
  const agentViews: AgentView[] = agents.map((agent) => agV(agent))

  // KJA this viewToAgent map should not be necessary. It is here right now
  // because there is some logic applied directly to Agent, extracted from AgentView.
  // But instead, there should be a function called on AgentView, and AgentView should
  // use its internal/private Agent reference to do the work.
  // ---
  // Map view -> underlying agent for internal predicates that require raw state
  const viewToAgent = new WeakMap<AgentView, Agent>()
  agents.forEach((agent, agentIndex) => {
    const correspondingAgentView = agentViews[agentIndex]
    if (correspondingAgentView !== undefined) {
      viewToAgent.set(correspondingAgentView, agent)
    }
  })

  // Quick lookup from Agent id -> AgentView
  const agentIdToView = new Map<string, AgentView>()
  agents.forEach((agent, index) => {
    const view = agentViews[index]
    if (view !== undefined) {
      agentIdToView.set(agent.id, view)
    }
  })

  function toAgentsView(views: AgentView[]): AgentsView {
    // Create an array-like instance and augment with chainable helpers
    const agentViewArray: AgentView[] = [...views]
    const impl = {
      withIds: (ids: readonly string[]): AgentsView =>
        toAgentsView(ids.map((id) => agentIdToView.get(id)).filter((agent): agent is AgentView => agent !== undefined)),
      notAvailable: (): AgentsView => toAgentsView(agentViewArray.filter((agent) => !agent.isAvailable())),
      getTerminated: (): AgentsView => toAgentsView(agentViewArray.filter((agentView) => agentView.isTerminated())),
      inTransit: (): AgentsView => toAgentsView(agentViewArray.filter((agentView) => agentView.isInTransit())),
      deployedOnMissionSite: (missionSiteId: string): AgentsView =>
        toAgentsView(
          agentViewArray.filter((agentView) => {
            const underlyingAgent = viewToAgent.get(agentView)
            return (
              underlyingAgent !== undefined &&
              underlyingAgent.assignment === missionSiteId &&
              underlyingAgent.state === 'OnMission'
            )
          }),
        ),
      validateAvailable: (selectedAgentIds: string[]): ValidateAvailableAgentsResult =>
        validateAvailableAgents(agentsView, selectedAgentIds),
      validateInvariants: (): void => {
        agentViewArray.forEach((agentView) => {
          const underlyingAgent = viewToAgent.get(agentView)
          if (underlyingAgent !== undefined) {
            validateAgentLocalInvariants(underlyingAgent)
          }
        })
      },
      // KJA use toArray everywhere where applicable. Search for "agent is Agent => agent !== undefined"
      toArray: (): Agent[] =>
        agentViewArray.map((agentView) => {
          const agent = viewToAgent.get(agentView)
          if (agent === undefined) {
            throw new Error(`Agent not found for view: ${JSON.stringify(agentView)}`)
          }
          return agent
        }),
    }
    const agentsView = Object.assign(agentViewArray, impl)

    return Object.freeze(agentsView)
  }

  return toAgentsView(agentViews)
}

// KJA implement memoized selector for AgentsView:
//
// const selectAgentsArray = (state: RootState) => state.undoable.present.gameState.agents
//
// export const selectAgentsView: (state: RootState) => AgentsView = createSelector(
//   [selectAgentsArray],
//   (agents) => agsV(agents)
// )
//
// See 4) Memoized selector that returns the wrapper
// In https://chatgpt.com/c/68983db9-3fac-832d-ba85-3b9aaaa807d5
