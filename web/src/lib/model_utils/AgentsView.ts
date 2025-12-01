import { validateAgentLocalInvariants } from './validateAgentInvariants'
import type { Agent } from '../model/agentModel'
import type { MissionSiteId } from '../model/model'
import { f6cmp } from '../primitives/fixed6Primitives'
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
  onTrainingAssignment(): AgentsView
  available(): AgentsView
  notAvailable(): AgentsView
  onAssignment(): AgentsView
  notOnAssignment(): AgentsView
  recallable(): AgentsView
  terminated(): AgentsView
  notTerminated(): AgentsView
  inTransit(): AgentsView
  sortedByEffectiveSkill(): AgentsView
  applyExhaustion(exhaustion: number): void
  deployedOnMissionSite(missionSiteId: MissionSiteId): AgentsView
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
    notOnAssignment: (): AgentsView =>
      toAgsV(agVArr.filter((agent) => !agent.isOnAssignment() && !agent.isOnTrainingAssignment())),
    recallable: (): AgentsView =>
      toAgsV(agVArr.filter((agent) => agent.isOnAssignment() || agent.isOnTrainingAssignment())),
    onContractingAssignment: (): AgentsView => toAgsV(agVArr.filter((agent) => agent.isOnContractingAssignment())),
    onEspionageAssignment: (): AgentsView => toAgsV(agVArr.filter((agent) => agent.isOnEspionageAssignment())),
    onTrainingAssignment: (): AgentsView => toAgsV(agVArr.filter((agent) => agent.isOnTrainingAssignment())),
    terminated: (): AgentsView => toAgsV(agVArr.filter((agentView) => agentView.isTerminated())),
    notTerminated: (): AgentsView => toAgsV(agVArr.filter((agentView) => !agentView.isTerminated())),
    inTransit: (): AgentsView => toAgsV(agVArr.filter((agentView) => agentView.isInTransit())),
    sortedByEffectiveSkill: (): AgentsView =>
      toAgsV(agVArr.toSorted((ag1, ag2) => f6cmp(ag1.effectiveSkill(), ag2.effectiveSkill()))),
    applyExhaustion: (exhaustion: number): void => {
      agVArr.forEach((agentView) => {
        agentView.agent().exhaustion = Math.max(0, agentView.agent().exhaustion + exhaustion)
      })
    },
    deployedOnMissionSite: (missionSiteId: MissionSiteId): AgentsView =>
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
