import type { Agent } from '../model/agentModel'
import type { GameState } from '../model/gameStateModel'

export function nonTerminatedAgents(gameState: GameState): Agent[] {
  return gameState.agents.filter((agent) => agent.state !== 'Terminated')
}
