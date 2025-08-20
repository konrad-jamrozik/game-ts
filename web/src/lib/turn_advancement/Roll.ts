/**
 * Combat and dice rolling utilities for deployed mission site update.
 */

export type ContestRoll = {
  attackerValue: number
  defenderValue: number
  successProbability: number
  roll: number
  success: boolean
}

export type RangeRoll = {
  min: number
  max: number
  roll: number
}

/**
 * Performs a contest roll using Bradley-Terry formula with exponent k=2
 * P(success) = A^2 / (A^2 + D^2)
 * // KJA update this formula to be: P(success) = 1 / (1+(D/A)^2)
 * @param attackerValue The attacker's contested value (typically effective skill)
 * @param defenderValue The defender's contested value (typically effective skill)
 * @returns The contest roll result
 */
export function contestRoll(attackerValue: number, defenderValue: number): ContestRoll {
  // Calculate success probability using Bradley-Terry formula
  const attackerSquared = attackerValue * attackerValue
  const defenderSquared = defenderValue * defenderValue
  const successProbability = attackerSquared / (attackerSquared + defenderSquared)

  // Round to 2 decimal places as specified
  const roundedProbability = Math.floor(successProbability * 100) / 100

  // Roll a random number between 0 and 1
  const roll = Math.random()
  const success = roll < roundedProbability

  return {
    attackerValue,
    defenderValue,
    successProbability: roundedProbability,
    roll,
    success,
  }
}

/**
 * Performs a range roll, selecting a random value from the given range (inclusive)
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns The range roll result
 */
export function rangeRoll(min: number, max: number): RangeRoll {
  const range = max - min + 1
  const roll = Math.floor(Math.random() * range) + min

  return {
    min,
    max,
    roll,
  }
}
