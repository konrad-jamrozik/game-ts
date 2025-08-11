import { validateAgentLocalInvariants } from '../../utils/validateAgentInvariants'
import type { Agent } from '../model'
import { getAgentUpkeep, getContractingIncome, getEspionageIntel } from '../ruleset'
import { agV, type AgentView } from './AgentView'
import { validateAvailableAgents, validateOnAssignmentAgents, type ValidateAgentsResult } from './validateAgents'

// Possible future work: rename AgentsView to Agents, AgentView, to Agent,
// and current Agent to AgentDTO or AgentModel or AgentData
export type AgentsView = readonly AgentView[] & AgentsViewMethods

export function agsV(agents: Agent[]): AgentsView {
  const agentIdToView = new Map(agents.map((agent) => [agent.id, agV(agent)]))
  const allAgentViewArr = [...agentIdToView.values()]

  function toAgentsView(agentViewArr: AgentView[]): AgentsView {
    const agentsViewMethods: AgentsViewMethods = getAgentsViewMethods(agentViewArr, agentIdToView, toAgentsView)
    const agentsView: AgentsView = Object.assign([...agentViewArr], agentsViewMethods)

    return Object.freeze(agentsView)
  }

  return toAgentsView(allAgentViewArr)
}

type AgentsViewMethods = Readonly<{
  withIds(ids: readonly string[]): AgentsView
  onContractingAssignment(): AgentsView
  onEspionageAssignment(): AgentsView
  available(): AgentsView
  notAvailable(): AgentsView
  onAssignment(assignment: string): AgentsView
  notOnAssignment(): AgentsView
  terminated(): AgentsView
  notTerminated(): AgentsView
  inTransit(): AgentsView
  agentUpkeep(): number
  contractingIncome(): number
  espionageIntel(): number
  deployedOnMissionSite(missionSiteId: string): AgentsView
  validateAvailable(selectedAgentIds: string[]): ValidateAgentsResult
  validateOnAssignment(selectedAgentIds: string[]): ValidateAgentsResult
  validateInvariants(): void
  toAgentArray(): Agent[]
}>

function getAgentsViewMethods(
  agVArr: AgentView[],
  agentIdToView: Map<string, AgentView>,
  toAgsV: (agentViewArray: AgentView[]) => AgentsView,
): AgentsViewMethods {
  const methods: AgentsViewMethods = {
    withIds: (ids: readonly string[]): AgentsView =>
      toAgsV(ids.map((id) => agentIdToView.get(id)).filter((agent): agent is AgentView => agent !== undefined)),
    available: (): AgentsView => toAgsV(agVArr.filter((agent) => agent.isAvailable())),
    notAvailable: (): AgentsView => toAgsV(agVArr.filter((agent) => !agent.isAvailable())),
    onAssignment: (): AgentsView => toAgsV(agVArr.filter((agent) => agent.isOnAssignment())),
    notOnAssignment: (): AgentsView => toAgsV(agVArr.filter((agent) => !agent.isOnAssignment())),
    onContractingAssignment: (): AgentsView => toAgsV(agVArr.filter((agent) => agent.isOnContractingAssignment())),
    onEspionageAssignment: (): AgentsView => toAgsV(agVArr.filter((agent) => agent.isOnEspionageAssignment())),
    terminated: (): AgentsView => toAgsV(agVArr.filter((agentView) => agentView.isTerminated())),
    notTerminated: (): AgentsView => toAgsV(agVArr.filter((agentView) => !agentView.isTerminated())),
    inTransit: (): AgentsView => toAgsV(agVArr.filter((agentView) => agentView.isInTransit())),
    agentUpkeep: (): number => getAgentUpkeep(toAgsV(agVArr)),
    contractingIncome: (): number => getContractingIncome(toAgsV(agVArr)),
    espionageIntel: (): number => getEspionageIntel(toAgsV(agVArr)),
    deployedOnMissionSite: (missionSiteId: string): AgentsView =>
      toAgsV(
        agVArr.filter((agentView) => {
          const agent = agentView.agent()
          return agent.assignment === missionSiteId && agent.state === 'OnMission'
        }),
      ),
    validateAvailable: (selectedAgentIds: string[]): ValidateAgentsResult =>
      validateAvailableAgents(toAgsV(agVArr), selectedAgentIds),
    validateOnAssignment: (selectedAgentIds: string[]): ValidateAgentsResult =>
      validateOnAssignmentAgents(toAgsV(agVArr), selectedAgentIds),
    validateInvariants: (): void => {
      agVArr.forEach((agentView) => {
        const underlyingAgent = agentView.agent()
        validateAgentLocalInvariants(underlyingAgent)
      })
    },
    toAgentArray: (): Agent[] => agVArr.map((agentView) => agentView.agent()),
  }
  return methods
}
// KJA implement memoized selector for AgentsView. Then augment gameState with it (so it has AgentsView instead of just Agent[]) and use it instead of the many invocations of agsV or agV.
//
// const selectAgentsArray = (state: RootState) => state.undoable.present.gameState.agents
//
// export const selectAgentsView: (state: RootState) => AgentsView = createSelector(
//   [selectAgentsArray],
//   (agents) => agsV(agents)
// )
//
// Source:
// 4) Memoized selector that returns the wrapper
// In https://chatgpt.com/c/68983db9-3fac-832d-ba85-3b9aaaa807d5
