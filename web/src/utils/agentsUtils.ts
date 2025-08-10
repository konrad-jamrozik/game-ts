import type { Agent } from '../model/model'
import { validateAgentLocalInvariants } from './validateAgentInvariants'
import _ from 'radash'

export type AgentsView = Readonly<{
  getTerminated(): Agent[]
  inTransit(): Agent[]
  deployedOnMissionSite(missionSiteId: string): Agent[]
  validateInvariants(): void
  toArray(): readonly Agent[]
}>

export function createAgentsView(src: readonly Agent[]): AgentsView {
  // Precompute indexes/caches *once* for this instance, e.g.
  const byAssignment = _.group(src, (agent) => agent.assignment)

  const view: AgentsView = {
    getTerminated: () => src.filter((agent) => agent.state === 'Terminated'),
    inTransit: () => src.filter((agent) => agent.state === 'InTransit'),
    deployedOnMissionSite: (missionSiteId: string) => {
      const candidates = byAssignment[missionSiteId] ?? []
      return candidates.filter((agent) => agent.state === 'OnMission')
    },
    validateInvariants: () => src.forEach((agent) => validateAgentLocalInvariants(agent)),
    toArray: () => src,
  }

  return Object.freeze(view)
}
