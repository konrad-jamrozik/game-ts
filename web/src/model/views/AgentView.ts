import { floor } from '../../utils/mathUtils'
import { validateAgentLocalInvariants } from '../../utils/validateAgentInvariants'
import type { Agent } from '../model'

export type AgentView = Readonly<{
  isTerminated(): boolean
  isInTransit(): boolean
  isDeployedOnMissionSite(missionSiteId: string): boolean
  effectiveSkill(): number
  isAvailable(): boolean
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
    validateInvariants: () => validateAgentLocalInvariants(agent),
    agent: () => agent,
  }

  return Object.freeze(agentView)
}

// Calculates the effective skill of an agent. Refer to about_agents.md for details.
function effectiveSkill(agent: Agent): number {
  const hitPointsLost = agent.maxHitPoints - agent.hitPoints
  const hitPointsReduction = agent.maxHitPoints > 0 ? hitPointsLost / agent.maxHitPoints : 0
  const exhaustionReduction = agent.exhaustion / 100

  const result = agent.skill * (1 - hitPointsReduction) * (1 - exhaustionReduction)
  return floor(result)
}
