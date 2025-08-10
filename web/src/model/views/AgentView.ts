import { floor } from '../../utils/mathUtils'
import { validateAgentLocalInvariants } from '../../utils/validateAgentInvariants'
import type { Agent } from '../model'

export type AgentView = {
  isTerminated(): boolean
  isInTransit(): boolean
  isDeployedOnMissionSite(missionSiteId: string): boolean
  effectiveSkill(): number
  isAvailable(): boolean
  validateInvariants(): void
}

export function createAgentView(agent: Agent): AgentView {
  const view: AgentView = {
    isTerminated: () => agent.state === 'Terminated',
    isInTransit: () => agent.state === 'InTransit',
    isDeployedOnMissionSite: (missionSiteId: string) => agent.assignment === missionSiteId,
    effectiveSkill: () => effectiveSkill(agent),
    isAvailable: () => agent.state === 'Available',
    validateInvariants: () => validateAgentLocalInvariants(agent),
  }

  return Object.freeze(view)
}

// Calculates the effective skill of an agent. Refer to about_agents.md for details.
function effectiveSkill(agent: Agent): number {
  const hitPointsLost = agent.maxHitPoints - agent.hitPoints
  const hitPointsReduction = agent.maxHitPoints > 0 ? hitPointsLost / agent.maxHitPoints : 0
  const exhaustionReduction = agent.exhaustion / 100

  const result = agent.skill * (1 - hitPointsReduction) * (1 - exhaustionReduction)
  return floor(result)
}
