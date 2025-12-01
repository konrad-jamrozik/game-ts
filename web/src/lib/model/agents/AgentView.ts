import { effectiveSkill } from '../../domain_utils/actorUtils'
import { validateAgentLocalInvariants } from './validateAgentInvariants'
import type { Agent, MissionSiteId } from '../model'
import type { Fixed6 } from '../../primitives/fixed6Primitives'

export type AgentView = Readonly<{
  isTerminated(): boolean
  isInTransit(): boolean
  isDeployedOnMissionSite(missionSiteId: MissionSiteId): boolean
  effectiveSkill(): Fixed6
  isAvailable(): boolean
  isOnAssignment(): boolean
  isOnContractingAssignment(): boolean
  isOnEspionageAssignment(): boolean
  isOnTrainingAssignment(): boolean
  validateInvariants(): void
  agent(): Agent
}>

export function agV(agent: Agent): AgentView {
  const agentView: AgentView = {
    isTerminated: () => agent.state === 'Terminated',
    isInTransit: () => agent.state === 'InTransit',
    isDeployedOnMissionSite: (missionSiteId: MissionSiteId) => agent.assignment === missionSiteId,
    effectiveSkill: () => effectiveSkill(agent),
    isAvailable: () => agent.state === 'Available',
    isOnAssignment: () => agent.state === 'OnAssignment',
    isOnContractingAssignment: () => agV(agent).isOnAssignment() && agent.assignment === 'Contracting',
    isOnEspionageAssignment: () => agV(agent).isOnAssignment() && agent.assignment === 'Espionage',
    isOnTrainingAssignment: () => agent.state === 'InTraining' && agent.assignment === 'Training',
    validateInvariants: () => validateAgentLocalInvariants(agent),
    agent: () => agent,
  }

  return Object.freeze(agentView)
}
