import { getActivityLevelByOrd } from '../model_utils/factionActivityLevelUtils'
import type { FactionActivityLevelOrd } from '../model/factionModel'
import { asActivityLevelOrd } from '../model/modelOrdUtils'
import { assertInRange } from '../primitives/assertPrimitives'
import { rollIntIncToInc } from '../primitives/rolls'

/**
 * Get the next activity level, clamped at 7 (Total War).
 */
export function nextActivityLevelOrd(level: FactionActivityLevelOrd): FactionActivityLevelOrd {
  assertInRange(level, 0, 6)
  const next = level + 1
  return asActivityLevelOrd(next)
}

/**
 * Calculate the actual turns needed to progress from current level.
 * Randomized between min and max turns.
 */
export function calculateProgressionTurns(level: FactionActivityLevelOrd): number {
  const config = getActivityLevelByOrd(level)
  if (config.turnsMin === Infinity) {
    return Infinity
  }
  return rollIntIncToInc(config.turnsMin, config.turnsMax).roll
}
