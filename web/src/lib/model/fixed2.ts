import { assertMax2Dec, assertInteger } from '../utils/assert'
import { fmtPctDec1 } from '../utils/formatUtils'
import { div100Flr, floor, mult100Flr } from '../utils/mathUtils'

/**
 * Represents a fixed-point number with 2 decimal places precision.
 * For example: 700 represents 7.00, 110 represents 1.10, 2150 represents 21.50
 *
 * This type is used for agent skill values throughout the game state.
 */
export type Fixed2 = {
  readonly value: number
  readonly kind: 'Fixed2'
}

export function isF2(value: unknown): value is Fixed2 {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === 'Fixed2' &&
    'value' in value &&
    typeof value.value === 'number'
  )
}

/**
 * Converts a decimal value to Fixed2 format by multiplying by 100.
 * Use this when you want to create a Fixed2 value.
 *
 * For example:
 * toF2(7) creates fixed2(700), which represents 7.00.
 * toF2(1.1) creates fixed2(110), which represents 1.10.
 * toF2(21.75) creates fixed2(2175), which represents 21.75.
 */
export function toF2(value: number): Fixed2 {
  assertMax2Dec(value)
  return toF2Flr(value)
}

export function toF2Flr(value: number): Fixed2 {
  return fixed2(mult100Flr(value))
}

/**
 * Converts a Fixed2 value to an integer string by dividing by 100 and rounding down.
 * Use this when you want to display a Fixed2 value as a plain integer number.
 *
 * For example:
 * f2FlrStr(fixed2(700)) = "7"
 * f2FlrStr(fixed2(2150)) = "21" (not "21.5")
 * f2FlrStr(fixed2(2175)) = "21" (not "21.75")
 *
 */
export function f2FlrStr(value: Fixed2): string {
  return div100Flr(value.value).toString()
}

/**
 * Formats a Fixed2 value as a percentage with 1 decimal place, comparing it to a denominator.
 * For example:
 * f2fmtPctDec1(toF2(75), toF2(100)) = "75.0" (representing 75.0%)
 * f2fmtPctDec1(toF2(98.5), toF2(52)) = "189.4" (representing 189.4%)
 */
export function f2fmtPctDec1(nominator: Fixed2, denominator: Fixed2): string {
  return fmtPctDec1(nominator.value, denominator.value)
}

/**
 * Converts a Fixed2 value to a decimal number without rounding.
 * For example:
 * f2AsFloat(fixed2(700)) = 7.0
 * f2AsFloat(fixed2(2150)) = 21.5
 * f2AsFloat(fixed2(2175)) = 21.75
 */
export function f2AsFloat(fixed: Fixed2): number {
  return fixed.value / 100
}

/**
 * // KJA unused, do we need this?
 * Rounds down a Fixed2 value to the nearest integer (maintaining 2 decimal precision).
 * For example:
 * f2Flr(fixed2(2175.9)) = fixed2(2175) (representing 21.75)
 * f2Flr(fixed2(2150.7)) = fixed2(2150) (representing 21.50)
 */
export function f2Flr(fixed: Fixed2): Fixed2 {
  return fixed2(floor(fixed.value))
}

/**
 * Adds two Fixed2 values together.
 * For example:
 * f2Add(fixed2(700), fixed2(300)) = fixed2(1000) (representing 7.00 + 3.00 = 10.00)
 */
export function f2Add(first: Fixed2, second: Fixed2): Fixed2 {
  return fixed2(first.value + second.value)
}

/**
 * Multiplies a Fixed2 value by two decimal numbers and returns the result as a Fixed2.
 * The result is floored to maintain Fixed2 precision.
 * For example:
 * f2Mult(fixed2(1000), 0.5, 0.8) = fixed2(400) (representing 10.00 * 0.5 * 0.8 = 4.00)
 * f2Mult(fixed2(2150), 0.9, 0.95) = fixed2(1838) (representing 21.50 * 0.9 * 0.95 = 18.3825, floored to 18.38)
 */
export function f2Mult(first: Fixed2, second: number, third: number): Fixed2 {
  return toF2Flr(f2AsFloat(first) * second * third)
}

/**
 * Checks if two Fixed2 values are equal.
 * For example:
 * f2Equals(fixed2(700), fixed2(700)) = true
 * f2Equals(fixed2(700), fixed2(701)) = false
 */
export function f2Equals(first: Fixed2, second: Fixed2): boolean {
  return first.value === second.value
}

/**
 * Compares two Fixed2 values.
 * Returns a negative number if first < second, zero if first === second, or a positive number if first > second.
 * Useful for sorting and comparison operations.
 * For example:
 * f2Compare(fixed2(700), fixed2(800)) < 0 (7.00 < 8.00)
 * f2Compare(fixed2(800), fixed2(700)) > 0 (8.00 > 7.00)
 * f2Compare(fixed2(700), fixed2(700)) === 0 (7.00 === 7.00)
 */
export function f2Compare(first: Fixed2, second: Fixed2): number {
  return first.value - second.value
}

/**
 * Checks if the first Fixed2 value is less than the second.
 * For example:
 * f2lt(fixed2(700), fixed2(800)) = true (7.00 < 8.00)
 * f2lt(fixed2(800), fixed2(700)) = false (8.00 < 7.00 is false)
 */
export function f2lt(first: Fixed2, second: Fixed2): boolean {
  return first.value < second.value
}

/**
 * Creates a Fixed2 value from a number.
 * Use this when you have a raw number that represents a fixed-point value in this format.
 * For example:
 * fixed2(700) represents 7.00
 * fixed2(7000) represents 70.00
 * fixed2(7) represents 0.07
 * fixed2(7.7) throws an error
 * @internal
 */
function fixed2(value: number): Fixed2 {
  assertInteger(value)
  return { value, kind: 'Fixed2' }
}
