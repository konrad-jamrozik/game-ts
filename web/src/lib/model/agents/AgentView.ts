import { effectiveSkill } from '../../utils/actorUtils'
import { validateAgentLocalInvariants } from './validateAgentInvariants'
import type { Agent } from '../model'

export type AgentView = Readonly<{
  isTerminated(): boolean
  isInTransit(): boolean
  isDeployedOnMissionSite(missionSiteId: string): boolean
  effectiveSkill(): number
  isAvailable(): boolean
  isOnAssignment(): boolean
  isOnContractingAssignment(): boolean
  isOnEspionageAssignment(): boolean
  validateInvariants(): void
  agent(): Agent
}>

export function agV(agent: Agent): AgentView {
  const agentView: AgentView = {
    isTerminated: () => agent.state === 'Terminated',
    isInTransit: () => agent.state === 'InTransit',
    isDeployedOnMissionSite: (missionSiteId: string) => agent.assignment === missionSiteId,
    effectiveSkill: () => effectiveSkill(agent),
    isAvailable: () => agent.state === 'Available',
    isOnAssignment: () => agent.state === 'OnAssignment',
    isOnContractingAssignment: () => agV(agent).isOnAssignment() && agent.assignment === 'Contracting',
    isOnEspionageAssignment: () => agV(agent).isOnAssignment() && agent.assignment === 'Espionage',
    validateInvariants: () => validateAgentLocalInvariants(agent),
    agent: () => agent,
  }

  return Object.freeze(agentView)
}

