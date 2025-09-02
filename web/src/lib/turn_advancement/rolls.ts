/**
 * Combat and dice rolling utilities for deployed mission site update.
 */

import { toPrecisionRoundingDown } from '../utils/mathUtils'
import { CONTEST_ROLL_PRECISION } from '../model/ruleset/constants'
import { rand } from '../utils/controllableRandom'

export type ContestRoll = {
  attackerValue: number
  defenderValue: number
  successProbabilityPct: number
  failureProbabilityPct: number
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
export function rollContest(attackerValue: number, defenderValue: number, label?: string): ContestRoll {
  const ratioSquared = (defenderValue / attackerValue) ** 2
  const successProbability = 1 / (1 + ratioSquared)
  const successInt = toPrecisionRoundingDown(successProbability, CONTEST_ROLL_PRECISION)
  const failureInt = CONTEST_ROLL_PRECISION - successInt

  const roll = roll1to(CONTEST_ROLL_PRECISION, label)

  // Higher rolls are better: success when roll > P(failure)
  const success = roll > failureInt

  // Express the values as percentages with 0.01% precision
  const successProbabilityPct = successInt / (CONTEST_ROLL_PRECISION / 100)
  const failureProbabilityPct = failureInt / (CONTEST_ROLL_PRECISION / 100)
  const rollPct = roll / (CONTEST_ROLL_PRECISION / 100)

  return {
    attackerValue,
    defenderValue,
    successProbabilityPct,
    failureProbabilityPct,
    roll: rollPct,
    success,
  }
}

/**
 * Rolls a die (integer 1-precision, inclusive)
 */
function roll1to(precision: number, label?: string): number {
  return rollRange(1, precision, label).roll
}

/**
 * Performs a range roll, selecting a random value from the given range (inclusive)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param label - Optional label for controllable random in tests
 * @returns The range roll result
 */
export function rollRange(min: number, max: number, label?: string): RangeRoll {
  const range = max - min + 1
  const roll = Math.floor(rand.get(label) * range) + min

  return {
    min,
    max,
    roll,
  }
}
