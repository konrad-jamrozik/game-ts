import type { Actor, MissionSiteId } from '../model/model'
import type { Agent } from '../model/agentModel'

// Type guard function to determine if an Actor is an Agent
export function isAgent(actor: Actor): actor is Agent {
  return 'turnHired' in actor
}

export function notTerminated(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state !== 'Terminated')
}

export function inTransit(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'InTransit')
}

export function terminated(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Terminated')
}

export function available(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Available')
}

export function onAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'OnAssignment')
}

export function onContractingAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'OnAssignment' && agent.assignment === 'Contracting')
}

export function onEspionageAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'OnAssignment' && agent.assignment === 'Espionage')
}

export function deployedOnMissionSite(agents: Agent[], missionSiteId: MissionSiteId): Agent[] {
  return agents.filter((agent) => agent.assignment === missionSiteId && agent.state === 'OnMission')
}

export function withIds(agents: Agent[], ids: readonly string[]): Agent[] {
  const idSet = new Set(ids)
  return agents.filter((agent) => idSet.has(agent.id))
}

export function onTrainingAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'InTraining' && agent.assignment === 'Training')
}

export function recallable(agents: Agent[]): Agent[] {
  return agents.filter(
    (agent) => agent.state === 'OnAssignment' || (agent.state === 'InTraining' && agent.assignment === 'Training'),
  )
}

export function notAvailable(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state !== 'Available')
}

export function notOnAssignment(agents: Agent[]): Agent[] {
  return agents.filter(
    (agent) => agent.state !== 'OnAssignment' && !(agent.state === 'InTraining' && agent.assignment === 'Training'),
  )
}

export function applyExhaustion(agents: Agent[], exhaustion: number): void {
  for (const agent of agents) {
    agent.exhaustion = Math.max(0, agent.exhaustion + exhaustion)
  }
}
