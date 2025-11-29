import { asF6, asFloat, type Fixed6 } from '../fixed6'
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
 * @param threatLevel - The faction's threat level (as Fixed6)
 * @param suppression - The faction's suppression value (as Fixed6)
 * @returns The panic increase (never negative, as Fixed6)
 */
export function getPanicIncrease(threatLevel: Fixed6, suppression: Fixed6): Fixed6 {
  return asF6(Math.max(0, asFloat(threatLevel) - asFloat(suppression)))
}

export function getSuppressionAfterDecay(suppression: Fixed6): Fixed6 {
  return asF6(floor(asFloat(suppression) * (1 - SUPPRESSION_DECAY)))
}

/**
 * Calculates the total panic increase from all factions in the game state.
 *
 * @param gameState - The current game state
 * @returns Total panic increase value (as a number)
 */
export function getTotalPanicIncrease(gameState: GameState): number {
  let totalPanicIncrease = 0
  for (const faction of gameState.factions) {
    const panicIncrease = getPanicIncrease(faction.threatLevel, faction.suppression)
    totalPanicIncrease += asFloat(panicIncrease)
  }
  return totalPanicIncrease
}

/**
 * Calculates projected panic value after turn advancement (without mission panic reductions).
 * Panic increases by the sum of panic increases from all factions.
 *
 * @param gameState - The current game state
 * @returns Projected panic value (as Fixed6)
 */
export function getPanicNewBalance(gameState: GameState): Fixed6 {
  const totalPanicIncrease = getTotalPanicIncrease(gameState)
  return asF6(asFloat(gameState.panic) + totalPanicIncrease)
}
