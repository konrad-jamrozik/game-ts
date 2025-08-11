import { validateAgentLocalInvariants } from '../../utils/validateAgentInvariants'
import type { Agent } from '../model'
import { agV, type AgentView } from './AgentView'
import { validateAvailableAgents, validateOnAssignmentAgents, type ValidateAgentsResult } from './validateAgents'

// Possible future work: rename AgentsView to Agents, AgentView, to Agent, and current Agent to AgentModel
export type AgentsView = readonly AgentView[] & AgentsViewMethods

export function agsV(agents: Agent[]): AgentsView {
  const allAgentViewArr: AgentView[] = agents.map((agent) => agV(agent))

  // KJA this viewToAgent map should not be necessary. It is here right now
  // because there is some logic applied directly to Agent, extracted from AgentView.
  // But instead, there should be a function called on AgentView, and AgentView should
  // use its internal/private Agent reference to do the work.
  // ---
  // Map view -> underlying agent for internal predicates that require raw state
  const viewToAgent = new WeakMap<AgentView, Agent>()
  agents.forEach((agent, agentIndex) => {
    const correspondingAgentView = allAgentViewArr[agentIndex]
    if (correspondingAgentView !== undefined) {
      viewToAgent.set(correspondingAgentView, agent)
    }
  })

  // Quick lookup from Agent id -> AgentView
  const agentIdToView = new Map<string, AgentView>()
  agents.forEach((agent, index) => {
    const view = allAgentViewArr[index]
    if (view !== undefined) {
      agentIdToView.set(agent.id, view)
    }
  })

  function toAgentsView(agentViewArr: AgentView[]): AgentsView {
    const agentsViewMethods: AgentsViewMethods = getAgentsViewMethods(
      agentViewArr,
      agentIdToView,
      viewToAgent,
      toAgentsView,
    )
    const agentsView: AgentsView = Object.assign([...agentViewArr], agentsViewMethods)

    return Object.freeze(agentsView)
  }

  return toAgentsView(allAgentViewArr)
}

type AgentsViewMethods = Readonly<{
  withIds(ids: readonly string[]): AgentsView
  notAvailable(): AgentsView
  notOnAssignment(): AgentsView
  getTerminated(): AgentsView
  inTransit(): AgentsView
  deployedOnMissionSite(missionSiteId: string): AgentsView
  validateAvailable(selectedAgentIds: string[]): ValidateAgentsResult
  validateOnAssignment(selectedAgentIds: string[]): ValidateAgentsResult
  validateInvariants(): void
  toAgentArray(): Agent[]
}>

function getAgentsViewMethods(
  agentViewArr: AgentView[],
  agentIdToView: Map<string, AgentView>,
  viewToAgent: WeakMap<AgentView, Agent>,
  toAgentsView: (agentViewArray: AgentView[]) => AgentsView,
): AgentsViewMethods {
  const methods: AgentsViewMethods = {
    withIds: (ids: readonly string[]): AgentsView =>
      toAgentsView(ids.map((id) => agentIdToView.get(id)).filter((agent): agent is AgentView => agent !== undefined)),
    notAvailable: (): AgentsView => toAgentsView(agentViewArr.filter((agent) => !agent.isAvailable())),
    notOnAssignment: (): AgentsView => toAgentsView(agentViewArr.filter((agent) => !agent.isOnAssignment())),
    getTerminated: (): AgentsView => toAgentsView(agentViewArr.filter((agentView) => agentView.isTerminated())),
    inTransit: (): AgentsView => toAgentsView(agentViewArr.filter((agentView) => agentView.isInTransit())),
    deployedOnMissionSite: (missionSiteId: string): AgentsView =>
      toAgentsView(
        agentViewArr.filter((agentView) => {
          const underlyingAgent = viewToAgent.get(agentView)
          return (
            underlyingAgent !== undefined &&
            underlyingAgent.assignment === missionSiteId &&
            underlyingAgent.state === 'OnMission'
          )
        }),
      ),
    validateAvailable: (selectedAgentIds: string[]): ValidateAgentsResult =>
      validateAvailableAgents(toAgentsView(agentViewArr), selectedAgentIds),
    validateOnAssignment: (selectedAgentIds: string[]): ValidateAgentsResult =>
      validateOnAssignmentAgents(toAgentsView(agentViewArr), selectedAgentIds),
    validateInvariants: (): void => {
      agentViewArr.forEach((agentView) => {
        const underlyingAgent = viewToAgent.get(agentView)
        if (underlyingAgent !== undefined) {
          validateAgentLocalInvariants(underlyingAgent)
        }
      })
    },
    // KJA use toAgentArray everywhere where applicable. Search for "agent is Agent => agent !== undefined"
    toAgentArray: (): Agent[] =>
      agentViewArr.map((agentView) => {
        const agent = viewToAgent.get(agentView)
        if (agent === undefined) {
          throw new Error(`Agent not found for view: ${JSON.stringify(agentView)}`)
        }
        return agent
      }),
  }
  return methods
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
