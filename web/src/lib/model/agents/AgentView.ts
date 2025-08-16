import { floor } from '../../utils/mathUtils'
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

// Calculates the effective skill of an agent. Refer to about_agents.md for details.
function effectiveSkill(agent: Agent): number {
  const hitPointsLost = agent.maxHitPoints - agent.hitPoints
  const hitPointsReduction = Math.max(1 - (agent.maxHitPoints > 0 ? hitPointsLost / agent.maxHitPoints : 0), 0)
  // First 5 points of exhaustion have no impact
  const exhaustionReduction = Math.max(1 - Math.max(agent.exhaustion - 5, 0) / 100, 0)

  const result = agent.skill * hitPointsReduction * exhaustionReduction
  return floor(result)
}
