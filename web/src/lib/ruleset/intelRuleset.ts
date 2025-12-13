import type { GameState } from '../model/gameStateModel'

export function getIntelTurnDiff(gameState: GameState): number {
  return 0
}

export function getIntelNewBalance(gameState: GameState): number {
  return gameState.intel + getIntelTurnDiff(gameState)
}
