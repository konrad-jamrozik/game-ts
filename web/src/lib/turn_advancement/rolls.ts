/**
 * Combat and dice rolling utilities for deployed mission site update.
 */

import { div, multAndFloor } from '../utils/mathUtils'
import { BPS_PRECISION } from '../model/ruleset/constants'
import { rand } from '../utils/rand'

export type ContestRollResult = {
  attackerValue: number
  defenderValue: number
} & RollResult

export type RollResult = {
  successProbabilityPct: number
  failureProbabilityPct: number
  rollPct: number
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
 * contestRoll(100, 100) -> 50    % chance of success
 * contestRoll(100, 150) -> 30.76 % chance of success
 * contestRoll(150, 100) -> 69.23 % chance of success
 * For more examples refer to docs/design/about_deployed_mission_site.md
 *
 * @param attackerValue - The attacker's contested value (typically effective skill)
 * @param defenderValue - The defender's contested value (typically effective skill)
 * @param label - Optional label for controllable random in tests
 * @returns The contest roll result
 */
export function rollContest(attackerValue: number, defenderValue: number, label?: string): ContestRollResult {
  const ratioSquared = div(defenderValue, attackerValue) ** 2
  const successProbability = 1 / (1 + ratioSquared)

  const rollResult = rollAgainstProbability(successProbability, label)

  return {
    attackerValue,
    defenderValue,
    ...rollResult,
  }
}

export function rollAgainstProbability(probability: number, label?: string): RollResult {
  const [failureInt, successInt] = getSuccessAndFailureInts(probability)
  const roll = roll1to(BPS_PRECISION, label)

  // Higher rolls are better: success when roll > P(failure)
  const success = roll > failureInt

  // Express the values as percentages with 0.01% precision
  const successProbabilityPct = successInt / (BPS_PRECISION / 100)
  const failureProbabilityPct = failureInt / (BPS_PRECISION / 100)
  const rollPct = roll / (BPS_PRECISION / 100)

  return { successProbabilityPct, failureProbabilityPct, rollPct, success }
}

export function getSuccessAndFailureInts(successProbability: number): [number, number] {
  const successInt = multAndFloor(successProbability, BPS_PRECISION)
  const failureInt = BPS_PRECISION - successInt
  return [failureInt, successInt]
}

export function roll1to(precision: number, label?: string): number {
  return rollRange(1, precision, label).roll
}

/**
 * Performs a range roll, uniformly selecting a random value from the given (min, max) range, both inclusive.
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
