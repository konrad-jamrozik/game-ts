import { assertInRange, assertInteger, assertLessThan, assertLessThanOrEqual } from './assertPrimitives'
import { FIXED4_PRECISION, f6fmtPctDec2, f6fromF4, f6gt, f6sub, roundToF4, toF6, type Fixed6 } from './fixed6'
import { fmtPctDec2 } from './formatPrimitives'
import { div } from './mathPrimitives'
import { rand } from './rand'

export type ContestRollResult = {
  attackerValue: number
  defenderValue: number
} & RollResultQuantized

export type RollResultQuantized = {
  failureProbF4: Fixed6
  successProbF4: Fixed6
  rollF4: Fixed6
  success: boolean
}

export type RollResultFloat = {
  successProb: number
  roll: number
  success: boolean
}

export type RangeRoll = {
  min: number
  max: number
  pct: number
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

  const rollResult = rollAgainstProbabilityQuantized(successProbability, label)

  return {
    attackerValue,
    defenderValue,
    ...rollResult,
  }
}

export function rollAgainstProbabilityQuantized(probability: number, label?: string): RollResultQuantized {
  const [failureProbF4, successProbF4] = getRollF4Probabilities(probability)

  const rollF4 = rollFixed4(label)

  // Success when roll > P(failure)
  // I.e. higher rolls are better.
  // If e.g. failureProbF4 represents 0.0375, it means 3.75% chance of failure, or 96.25% chance of success.
  // This means that if we rolled anything from range [1, 375000], we would fail the roll,
  // hence we must roll at least 375001 to succeed.
  const success = f6gt(rollF4, failureProbF4)

  return { failureProbF4, successProbF4, rollF4, success }
}

/**
 * Refer to rolls.test.ts for examples of how this works.
 */
export function rollAgainstProbabilityFloat(successProb: number, label?: string): RollResultFloat {
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
export function getRollF4Probabilities(successProbability: number): [Fixed6, Fixed6] {
  const successProbF4 = roundToF4(successProbability)
  const failureProbF4 = f6sub(toF6(1), successProbF4)
  return [failureProbF4, successProbF4]
}

/**
 * First rolls a float in [0, 1) and then quantizes it to range [1, 10_000],
 * finally multiplying it by 100 to save it as Fixed6 of range [1, 1_000_000].
 *
 * That is:
 * - The underlying roll is a float in [0, 1)
 * - But then it is rounded/quantized to precision of Fixed4, i.e. an integer in range 10_000
 * - And finally it is multiplied by 100 to save it as Fixed6, i.e. an integer in range [1, 1_000_000].
 *
 * @param label - Optional label for controllable random in tests
 */
export function rollFixed4(label?: string): Fixed6 {
  const rollValue = roll1to(FIXED4_PRECISION, label)
  assertInRange(rollValue, 1, FIXED4_PRECISION)
  return f6fromF4(rollValue)
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
  return rollIntIncToInc(1, precision, label).roll
}

export function roll0IncTo1Exc(label?: string): RangeRoll {
  return rollInFloatRange(0, 1, label)
}

/**
 * Performs a range roll, uniformly selecting a random value from the given [min, max] range (both inclusive).
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param label - Optional label for controllable random in tests
 * @returns The range roll result
 */
export function rollIntIncToInc(min: number, max: number, label?: string): RangeRoll {
  assertInteger(min)
  assertInteger(max)
  assertLessThanOrEqual(min, max)
  // We roll [min, max), which contains (max - (min - 1)) integers
  // So rangeSize = max - min + 1
  // And max = rangeSize + min - 1
  // For example: [3, 7] = {3, 4, 5, 6, 7} = 5
  const rangeSize = max - min + 1

  // pct is a float in [0, 1)
  const pct = rand.get(label)

  // scaledPct is a float in [0, rangeSize)
  const scaledPct = pct * rangeSize

  // shiftedScaledPct is a float in [min, rangeSize + min)
  // which is in [min, max + 1)
  const shiftedScaledPct = scaledPct + min

  // roll is an integer in [min, max]
  const roll = Math.floor(shiftedScaledPct)

  return {
    min,
    max,
    pct,
    roll,
  }
}

/**
 * Performs a range roll, uniformly selecting a random value from the given [min, max) range
 * (min is inclusive, max is exclusive).
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @param label - Optional label for controllable random in tests
 * @returns The range roll result
 */
export function rollIntIncToExc(min: number, max: number, label?: string): RangeRoll {
  assertInteger(min)
  assertInteger(max)
  assertLessThan(min, max)
  // We roll [min, max), which contains (max - min) integers
  // So rangeSize = max - min
  // And max = rangeSize + min
  // For example: [3, 7) = {3, 4, 5, 6} = 4
  const rangeSize = max - min

  // pct is a float in [0, 1)
  const pct = rand.get(label)

  // scaledPct is a float in [0, rangeSize)
  const scaledPct = pct * rangeSize

  // shiftedScaledPct is a float in [min, rangeSize + min)
  // which is in [min, max)
  const shiftedScaledPct = scaledPct + min

  // roll is an integer in [min, max - 1]
  const roll = Math.floor(shiftedScaledPct)

  return {
    min,
    max,
    pct,
    roll,
  }
}

function rollInFloatRange(min: number, max: number, label?: string): RangeRoll {
  const range = max - min
  const pct = rand.get(label)
  const roll = pct * range + min
  return {
    min,
    max,
    pct,
    roll,
  }
}

/**
 * Formats a roll result for display.
 * See this function tests for examples.
 */
export function fmtRollResultFloat(rollResult: RollResultFloat): string {
  const failureProb = 1 - rollResult.successProb
  // Recalculate success based on actual values (roll >= failureProb)
  const actualSuccess = rollResult.roll >= failureProb
  const rollResultIcon = actualSuccess ? '✅' : '❌'

  // Add 0.0001 to roll value before formatting so that:
  // - Roll of 0 displays as 0.01% (not 0.00%)
  // - Roll of 0.9999 displays as 100.00% (not 99.99%)
  // Cap at 1.0 to prevent values > 100%
  const rollToDisplay = Math.min(rollResult.roll + 0.0001, 1)

  // // Check if rounding would cause a display mismatch:
  // // If displayed roll > displayed threshold but actual roll <= actual threshold,
  // // round roll down instead of up to avoid confusing display like "❌ roll 100.00% is <= 99.99% threshold"
  // const displayedRoll = roundToDec4(rollToDisplay)
  // const displayedThreshold = floorToDec4(failureProb)
  // if (displayedRoll > displayedThreshold && !actualSuccess) {
  //   // Round to nearest basis point (0.01%)
  //   rollToDisplay = roundToDec4(rollResult.roll)
  // }

  const rollPctStr = fmtPctDec2(rollToDisplay).padStart(7)
  const rollRelation = actualSuccess ? '> ' : '<='
  const thresholdPctStr = fmtPctDec2(failureProb).padStart(7)
  return `[${rollResultIcon} roll ${rollPctStr} is ${rollRelation} ${thresholdPctStr} threshold]`
}

/**
 * Formats roll result information
 * @param rollResult - The roll result
 * @returns Formatted string in the format "[roll% vs threshold% threshold]"
 */
export function fmtRollResultQuantized(rollResult: RollResultQuantized): string {
  const icon = rollResult.success ? '✅' : '❌'
  const relation = rollResult.success ? '> ' : '<='
  const rollPctStr = f6fmtPctDec2(rollResult.rollF4).padStart(7)
  const thresholdPctStr = f6fmtPctDec2(rollResult.failureProbF4).padStart(7)
  return `[${icon} roll ${rollPctStr} is ${relation} ${thresholdPctStr} threshold]`
}
