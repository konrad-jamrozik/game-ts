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
