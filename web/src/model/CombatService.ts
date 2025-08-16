/**
 * Combat and dice rolling utilities for deployed mission site update.
 */

export type Roll = Readonly<{
  skill: number
  difficulty: number
  roll: number
  threshold: number
  isAboveThreshold: boolean
  isAtOrAboveThreshold: boolean
  aboveThreshold: number
  belowThreshold: number
  aboveThresholdChancePct: number
  atOrAboveThresholdChancePct: number
  isAboveThresholdMsg: string
  isAtOrAboveThresholdMsg: string
}>

export function newRoll(skill: number, difficulty: number): Roll {
  const roll = rollDie()
  const [threshold] = calculateRollThreshold(skill, difficulty)
  const isAboveThreshold = roll > threshold
  const isAtOrAboveThreshold = roll >= threshold
  const aboveThreshold = Math.max(roll - threshold, 0)
  const belowThreshold = Math.max(threshold - roll, 0)
  const aboveThresholdChancePct = Math.min(Math.max(100 - threshold, 0), 100)
  const atOrAboveThresholdChancePct = Math.min(Math.max(101 - threshold, 0), 100)
  const isAboveThresholdMsg = isAboveThreshold ? '✅ success (> threshold)' : '❌ failure (<= threshold)'
  const isAtOrAboveThresholdMsg = isAtOrAboveThreshold ? '✅ success (>= threshold)' : '❌ failure (< threshold)'
  return {
    skill,
    difficulty,
    roll,
    threshold,
    isAboveThreshold,
    isAtOrAboveThreshold,
    aboveThreshold,
    belowThreshold,
    aboveThresholdChancePct,
    atOrAboveThresholdChancePct,
    isAboveThresholdMsg,
    isAtOrAboveThresholdMsg,
  }
}

/**
 * Rolls a die (integer 1-100, inclusive)
 */
export function rollDie(): number {
  // Note: here we are OK using Math.floor instead of my floor, because Math.random() will never return 1, so there
  // is no concern of floating point imprecision.
  const roll = Math.floor(Math.random() * 100) + 1
  return roll
}

/**
 * Calculates the roll threshold: 100 - skill + difficulty
 * Returns a tuple: [threshold, formula string]
 */
export function calculateRollThreshold(skill: number, difficulty: number): [number, string] {
  const threshold = 100 - skill + difficulty
  const formula = `${threshold} = 100 - skill (${skill}) + difficulty (${difficulty}) `
  return [threshold, formula]
}

/**
 * Calculates recovery time based on hit points lost
 */
// KJA actually use this function
export function calculateRecoveryTime(hitPointsLost: number, maxHitPoints: number): number {
  if (hitPointsLost <= 0) {
    return 0
  }

  const hitPointsLostPercentage = (hitPointsLost / maxHitPoints) * 100
  return Math.ceil(hitPointsLostPercentage / 2)
}
