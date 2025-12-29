import { f6ge, toF6 } from '../primitives/fixed6'
import type { GameState } from '../model/gameStateModel'

export function isGameLost(gameState: GameState): boolean {
  return f6ge(gameState.panic, toF6(1)) || gameState.money < 0
}

export function isGameWon(gameState: GameState): boolean {
  return (gameState.leadInvestigationCounts['lead-peace-on-earth'] ?? 0) > 0
}

export function isGameEnded(gameState: GameState): boolean {
  return isGameLost(gameState) || isGameWon(gameState)
}
