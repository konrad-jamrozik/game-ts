import { bps, type Bps } from '../bps'
import { floor } from '../../utils/mathUtils'
import type { GameState } from '../model'
import { SUPPRESSION_DECAY } from './constants'

/**
 * Calculates panic increase from faction threat level and suppression.
 *
 * Formula: Math.max(0, threatLevel - suppression)
 *
 * This is the source of truth for panic increase calculation.
 *
 * @param threatLevel - The faction's threat level (in basis points)
 * @param suppression - The faction's suppression value (in basis points)
 * @returns The panic increase (never negative, in basis points)
 */
export function getPanicIncrease(threatLevel: Bps, suppression: Bps): Bps {
  return bps(Math.max(0, threatLevel.value - suppression.value))
}

export function getSuppressionAfterDecay(suppression: Bps): Bps {
  // KJA refactor bps formula here
  return bps(floor(suppression.value * (1 - SUPPRESSION_DECAY)))
}

/**
 * Calculates the total panic increase from all factions in the game state.
 *
 * @param gameState - The current game state
 * @returns Total panic increase value (in basis points, as a number)
 */
export function getTotalPanicIncrease(gameState: GameState): number {
  let totalPanicIncrease = 0
  for (const faction of gameState.factions) {
    const panicIncrease = getPanicIncrease(faction.threatLevel, faction.suppression)
    totalPanicIncrease += panicIncrease.value
  }
  return totalPanicIncrease
}

/**
 * Calculates projected panic value after turn advancement (without mission panic reductions).
 * Panic increases by the sum of panic increases from all factions.
 *
 * @param gameState - The current game state
 * @returns Projected panic value (in basis points)
 */
export function getPanicNewBalance(gameState: GameState): Bps {
  const totalPanicIncrease = getTotalPanicIncrease(gameState)
  return bps(gameState.panic.value + totalPanicIncrease)
}
