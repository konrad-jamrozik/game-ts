import { effectiveSkill } from '../../utils/actorUtils'
import { validateAgentLocalInvariants } from './validateAgentInvariants'
import type { Agent, MissionSiteId } from '../model'

export type AgentView = Readonly<{
  isTerminated(): boolean
  isInTransit(): boolean
  isDeployedOnMissionSite(missionSiteId: MissionSiteId): boolean
  effectiveSkill(): number
  isAvailable(): boolean
  isOnAssignment(): boolean
  isInvestigatingLead(investigationId: string): boolean
  isOnContractingAssignment(): boolean
  isOnEspionageAssignment(): boolean
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
    isInvestigatingLead: (investigationId: string) => agent.assignment === investigationId,
    isOnContractingAssignment: () => agV(agent).isOnAssignment() && agent.assignment === 'Contracting',
    isOnEspionageAssignment: () => agV(agent).isOnAssignment() && agent.assignment === 'Espionage',
    validateInvariants: () => validateAgentLocalInvariants(agent),
    agent: () => agent,
  }

  return Object.freeze(agentView)
}
