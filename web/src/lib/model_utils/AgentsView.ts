import type { Agent } from '../model/agentModel'
import { agV, type AgentView } from './AgentView'

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
  toAgentArray(): Agent[]
}>

function getAgentsViewMethods(
  agVArr: AgentView[],
  _agentIdToView: Map<string, AgentView>,
  _toAgsV: (agentViewArray: AgentView[]) => AgentsView,
): AgentsViewMethods {
  const methods: AgentsViewMethods = {
    toAgentArray: (): Agent[] => agVArr.map((agentView) => agentView.agent()),
  }
  return methods
}
