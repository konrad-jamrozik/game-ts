/**
 * Combat and dice rolling utilities for deployed mission site update.
 */

import { bps, BPS_PRECISION, type Bps } from '../model/bps'
import { f2divPrecise, type Fixed2 } from '../model/fixed2'
import { f4gt, f4sub, toF4 } from '../model/fixed4'
import { floorToDec4 } from '../utils/mathUtils'
import { rand } from '../utils/rand'

export type ContestRollResult = {
  attackerValue: Fixed2
  defenderValue: Fixed2
} & RollResult

export type RollResult = {
  failureInt: Bps
  successInt: Bps
  rollInt: Bps
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
export function rollContest(attackerValue: Fixed2, defenderValue: Fixed2, label?: string): ContestRollResult {
  // Note: here we use f2divPrecise instead of f2div to get precise probability calculations,
  // f2div floors the division result to fit into Fixed2, thus losing precision.
  const ratioSquared = f2divPrecise(defenderValue, attackerValue) ** 2
  const successProbability = 1 / (1 + ratioSquared)

  const rollResult = rollAgainstProbability(successProbability, label)

  return {
    attackerValue,
    defenderValue,
    ...rollResult,
  }
}

// KJA idea for new approach to rolling:
// Input: precise float probability.
// Roll happens with exact precision, not on integers, as currently.
// Roll returns exact floats rolled, not Bps.
//
// There is a formatting function
// KJA idea for new approach to storing numbers:
// - numbers are stored as either:
//  - number, if integers,
//  - OR Fixed6, i.e. F6  == precision of 1/100 of 0.01% == 0.0001%.
// - all operations are always precise floating points
// - When displayed, appropriate format functions are called at the very last moment, like "format as 100.00%"
// -
/**
 * Refer to rolls.test.ts for examples of how this works.
 */
export function rollAgainstProbability(probability: number, label?: string): RollResult {
  const [failureInt, successInt] = getSuccessAndFailureInts(probability)

  // roll a random number from [1, 10_000]
  // Here 10_000 denotes 100%, so we are uniformly choosing a 0.01% precision value.
  const rollInt = rollBps(label)

  // Success when roll > P(failure)
  // I.e. higher rolls are better.
  // If e.g. failureInt is 375, it means 3.75% chance of failure, or 96.25% chance of success.
  // So we had to roll at least 376 from the range [1, 10_000] to succeed.
  const success = f4gt(rollInt, failureInt)

  return { failureInt, successInt, rollInt, success }
}

/**
 * @param successProbability - Success probability as a decimal in range [0, 1], both inclusive.
 * @returns A tuple of [failureInt, successInt] where:
 * - failureInt: Failure probability expressed as an integer in basis points (0-10000 range, where 10000 = 100%)
 * - successInt: Success probability expressed as an integer in basis points (0-10000 range, where 10000 = 100%)
 */
export function getSuccessAndFailureInts(successProbability: number): [Bps, Bps] {
  const successInt = toF4(floorToDec4(successProbability))
  const failureInt = f4sub(toF4(1), successInt)
  return [failureInt, successInt]
}

/**
 * Rolls a random Bps value from 1 to 10_000 (inclusive), representing the range (0, 1] in basis points.
 *
 * @param label - Optional label for controllable random in tests
 * @returns A random Bps value in the range [1, 10_000], equivalent to (0.01%, 100%] or (0, 1] as a decimal
 */
export function rollBps(label?: string): Bps {
  return bps(roll1to(BPS_PRECISION, label))
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
