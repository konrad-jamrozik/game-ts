import type { Agent } from '../model/agentModel'
import type { GameState } from '../model/gameStateModel'
import type { MissionSiteId } from '../model/model'

export function agentsNotTerminated(gameState: GameState): Agent[] {
  return gameState.agents.filter((agent) => agent.state !== 'Terminated')
}

export function agentsInTransit(gameState: GameState): Agent[] {
  return gameState.agents.filter((agent) => agent.state === 'InTransit')
}

export function agentsTerminated(gameState: GameState): Agent[] {
  return gameState.agents.filter((agent) => agent.state === 'Terminated')
}

export function agentsAvailable(gameState: GameState): Agent[] {
  return gameState.agents.filter((agent) => agent.state === 'Available')
}

export function agentsOnAssignment(gameState: GameState): Agent[] {
  return gameState.agents.filter((agent) => agent.state === 'OnAssignment')
}

export function agentsOnContractingAssignment(gameState: GameState): Agent[] {
  return gameState.agents.filter((agent) => agent.state === 'OnAssignment' && agent.assignment === 'Contracting')
}

export function agentsOnEspionageAssignment(gameState: GameState): Agent[] {
  return gameState.agents.filter((agent) => agent.state === 'OnAssignment' && agent.assignment === 'Espionage')
}

export function agentsDeployedOnMissionSite(gameState: GameState, missionSiteId: MissionSiteId): Agent[] {
  return gameState.agents.filter((agent) => agent.assignment === missionSiteId && agent.state === 'OnMission')
}

// Functions that work on Agent[] directly (not requiring GameState)
// KJA move these to agentUtils.ts, or make the argument to be gameState instead

export function agentsWithIds(agents: Agent[], ids: readonly string[]): Agent[] {
  const idSet = new Set(ids)
  return agents.filter((agent) => idSet.has(agent.id))
}

export function agentsOnTrainingAssignmentFromArray(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'InTraining' && agent.assignment === 'Training')
}

export function agentsOnTrainingAssignment(gameState: GameState): Agent[] {
  return agentsOnTrainingAssignmentFromArray(gameState.agents)
}

export function agentsRecallableFromArray(agents: Agent[]): Agent[] {
  return agents.filter(
    (agent) => agent.state === 'OnAssignment' || (agent.state === 'InTraining' && agent.assignment === 'Training'),
  )
}

export function agentsNotAvailableFromArray(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state !== 'Available')
}

export function agentsNotOnAssignmentFromArray(agents: Agent[]): Agent[] {
  return agents.filter(
    (agent) => agent.state !== 'OnAssignment' && !(agent.state === 'InTraining' && agent.assignment === 'Training'),
  )
}

export function agentsNotTerminatedFromArray(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state !== 'Terminated')
}

export function agentsAvailableFromArray(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Available')
}

export function applyExhaustionToAgents(agents: Agent[], exhaustion: number): void {
  for (const agent of agents) {
    agent.exhaustion = Math.max(0, agent.exhaustion + exhaustion)
  }
}
