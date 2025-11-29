/**
 * Combat and dice rolling utilities for deployed mission site update.
 */

import { asF6, f6gt, f6sub, type Fixed6 } from '../model/fixed6'
import { fmtPctDec2 } from '../utils/formatUtils'
import { div, floorToDec4 } from '../utils/mathUtils'
import { rand } from '../utils/rand'

const FIXED6_PRECISION = 1_000_000

export type ContestRollResult = {
  attackerValue: number
  defenderValue: number
} & RollResultNew

export type RollResult = {
  failureInt: Fixed6
  successInt: Fixed6
  rollInt: Fixed6
  success: boolean
}

export type RollResultNew = {
  successProb: number
  roll: number
  success: boolean
}

export type RangeRoll = {
  min: number
  max: number
  roll: number
}

/**
 * Performs a contest roll using the Bradley-Terry formula with exponent k=2:
 * P(success) = 1 / (1 + (D/A)^2)
 * P(failure) = 1 - P(success)
 * Higher rolls are better - success occurs when roll > P(failure)
 *
 * @example
 * rollContest(100, 100) -> 50    % chance of success
 * rollContest(100, 150) -> 30.76 % chance of success
 * rollContest(150, 100) -> 69.23 % chance of success
 * For more examples refer to docs/design/about_deployed_mission_site.md
 *
 * @param attackerValue - The attacker's contested value (typically effective skill)
 * @param defenderValue - The defender's contested value (typically effective skill)
 * @param label - Optional label for controllable random in tests
 * @returns The contest roll result
 */
export function rollContest(attackerValue: number, defenderValue: number, label?: string): ContestRollResult {
  // Note: here we use f2divPrecise instead of f2div to get precise probability calculations,
  // f2div floors the division result to fit into Fixed2, thus losing precision.
  const ratioSquared = div(defenderValue, attackerValue) ** 2
  const successProbability = 1 / (1 + ratioSquared)

  const rollResult = rollAgainstProbabilityNew(successProbability, label)

  return {
    attackerValue,
    defenderValue,
    ...rollResult,
  }
}

export function rollAgainstProbability(probability: number, label?: string): RollResult {
  const [failureInt, successInt] = getSuccessAndFailureInts(probability)

  // roll a random number from [1, 1_000_000]
  // Here 1_000_000 denotes 1.0, so we are uniformly choosing a 0.000001 precision value.
  const rollInt = rollFixed6(label)

  // Success when roll > P(failure)
  // I.e. higher rolls are better.
  // If e.g. failureInt represents 0.0375, it means 3.75% chance of failure, or 96.25% chance of success.
  // So we had to roll at least that value from the range [1, 1_000_000] to succeed.
  const success = f6gt(rollInt, failureInt)

  return { failureInt, successInt, rollInt, success }
}

/**
 * Refer to rolls.test.ts for examples of how this works.
 */
// KJA curr work
export function rollAgainstProbabilityNew(successProb: number, label?: string): RollResultNew {
  const failureProb = 1 - successProb

  const { roll } = roll0IncTo1Exc(label)

  const success = roll >= failureProb

  return {
    successProb,
    roll,
    success,
  }
}

/**
 * @param successProbability - Success probability as a decimal in range [0, 1], both inclusive.
 * @returns A tuple of [failureInt, successInt] where:
 * - failureInt: Failure probability expressed as Fixed6 (0-1_000_000 range, where 1_000_000 = 1.0)
 * - successInt: Success probability expressed as Fixed6 (0-1_000_000 range, where 1_000_000 = 1.0)
 */
export function getSuccessAndFailureInts(successProbability: number): [Fixed6, Fixed6] {
  const successInt = asF6(successProbability)
  const failureInt = f6sub(asF6(1), successInt)
  return [failureInt, successInt]
}

/**
 * Rolls a random Fixed6 value from 1 to 1_000_000 (inclusive), representing the range (0, 1] in Fixed6.
 *
 * @param label - Optional label for controllable random in tests
 * @returns A random Fixed6 value in the range [1, 1_000_000], equivalent to (0, 1] as a decimal
 */
export function rollFixed6(label?: string): Fixed6 {
  const rollValue = roll1to(FIXED6_PRECISION, label)
  return asF6(rollValue / FIXED6_PRECISION)
}

/**
 * Performs a roll from 1 to precision (inclusive), uniformly selecting a random integer value.
 * This is a convenience function that calls rollRange(1, precision, label).
 *
 * @example
 * roll1to(10000) -> returns a value in [1, 10000] (inclusive)
 *
 * @param precision - Maximum value (inclusive)
 * @param label - Optional label for controllable random in tests
 * @returns A random integer from 1 to precision (inclusive)
 */
export function roll1to(precision: number, label?: string): number {
  return rollRange(1, precision, label).roll
}

export function roll0IncTo1Exc(label?: string): RangeRoll {
  return rollInFloatRange(0, 1, label)
}

function rollInFloatRange(min: number, max: number, label?: string): RangeRoll {
  const range = max - min
  const randResult = rand.get(label)
  const roll = randResult * range + min
  return {
    min,
    max,
    roll,
  }
}

/**
 * Performs a range roll, uniformly selecting a random value from the given (min, max) range, both inclusive.
 *
 * @example
 * rollRange(1, 100) -> returns a value in [1, 100] (inclusive)
 * - range = 100 - 1 + 1 = 100
 * - randResult * 100 gives [0, 100)
 * - Math.floor(randResult * 100) gives [0, 99] (integers)
 * - Math.floor(randResult * 100) + 1 gives [1, 100] (inclusive)
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param label - Optional label for controllable random in tests
 * @returns The range roll result
 */
export function rollRange(min: number, max: number, label?: string): RangeRoll {
  const range = max - min + 1
  const randResult = rand.get(label)
  const roll = Math.floor(randResult * range) + min

  return {
    min,
    max,
    roll,
  }
}

/**
 * Formats a roll result for display.
 * See this function tests for examples.
 */
export function fmtRoll(rollResult: RollResultNew): string {
  const failureProb = 1 - rollResult.successProb
  // Recalculate success based on actual values (roll >= failureProb)
  const actualSuccess = rollResult.roll >= failureProb
  const rollResultIcon = actualSuccess ? '✅' : '❌'

  // Add 0.0001 to roll value before formatting so that:
  // - Roll of 0 displays as 0.01% (not 0.00%)
  // - Roll of 0.9999 displays as 100.00% (not 99.99%)
  // Cap at 1.0 to prevent values > 100%
  let rollToDisplay = Math.min(rollResult.roll + 0.0001, 1)

  // Check if rounding would cause a display mismatch:
  // If displayed roll > displayed threshold but actual roll <= actual threshold,
  // round roll down instead of up to avoid confusing display like "❌ roll 100.00% is <= 99.99% threshold"
  const displayedRoll = floorToDec4(rollToDisplay)
  const displayedThreshold = floorToDec4(failureProb)
  if (displayedRoll > displayedThreshold && !actualSuccess) {
    // Round down to nearest basis point (0.01%)
    rollToDisplay = floorToDec4(rollResult.roll)
  }

  const rollPctStr = fmtPctDec2(rollToDisplay).padStart(7)
  const rollRelation = actualSuccess ? '> ' : '<='
  const thresholdPctStr = fmtPctDec2(failureProb).padStart(7)
  return `[${rollResultIcon} roll ${rollPctStr} is ${rollRelation} ${thresholdPctStr} threshold]`
}
