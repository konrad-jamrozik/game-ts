import { fmtPctDec4 } from '../../utils/formatUtils'
import { f6ge, f6max, f6min, f6sub, toF, toF6, toF6r, type Fixed6 } from '../fixed6'
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
  return toF6(Math.max(0, toF(threatLevel) - toF(suppression)))
}

export function getSuppressionToDecay(suppression: Fixed6): Fixed6 {
  const standardDecay = toF6r(toF(suppression) * SUPPRESSION_DECAY)
  // If suppression is greater than or equal to 0.02%, then decay by at least 0.01%,
  // otherwise decay all of the remaining suppression.
  const minDecay = f6ge(suppression, toF6(0.0002)) ? toF6(0.0001) : suppression
  const decay = f6min(f6max(standardDecay, minDecay), suppression)
  console.log('getSuppressionDecay:', {
    suppression: fmtPctDec4(toF(suppression)),
    SUPPRESSION_DECAY,
    decay: fmtPctDec4(toF(decay)),
  })
  return decay
}

export function decaySuppression(suppression: Fixed6): { decayedSuppression: Fixed6; suppressionDecay: Fixed6 } {
  const suppressionToDecay = getSuppressionToDecay(suppression)
  const decayedSuppression = f6sub(suppression, suppressionToDecay)
  return { decayedSuppression, suppressionDecay: suppressionToDecay }
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
    totalPanicIncrease += toF(panicIncrease)
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
  return toF6(toF(gameState.panic) + totalPanicIncrease)
}
