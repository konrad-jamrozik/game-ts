import { fmtPctDec1 } from '../utils/formatUtils'
import { floor } from '../utils/mathUtils'

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
  return fixed2(value * 100)
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
export function f2FlrStr(fixed: Fixed2): string {
  return floor(fixed.value / 100).toString()
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
 * fromFixed2Decimal(fixed2(700)) = 7.0
 * fromFixed2Decimal(fixed2(2150)) = 21.5
 * fromFixed2Decimal(fixed2(2175)) = 21.75
 */
export function fromF2Dec(fixed: Fixed2): number {
  return fixed.value / 100
}

/**
 * Rounds down a Fixed2 value to the nearest integer (maintaining 2 decimal precision).
 * For example:
 * floorFixed2(fixed2(2175.9)) = fixed2(2175) (representing 21.75)
 * floorFixed2(fixed2(2150.7)) = fixed2(2150) (representing 21.50)
 */
export function floorF2(fixed: Fixed2): Fixed2 {
  return fixed2(floor(fixed.value))
}

/**
 * Adds two Fixed2 values together.
 * For example:
 * addFixed2(fixed2(700), fixed2(300)) = fixed2(1000) (representing 7.00 + 3.00 = 10.00)
 */
export function addF2(first: Fixed2, second: Fixed2): Fixed2 {
  return fixed2(first.value + second.value)
}

/**
 * Checks if two Fixed2 values are equal.
 * For example:
 * equalsFixed2(fixed2(700), fixed2(700)) = true
 * equalsFixed2(fixed2(700), fixed2(701)) = false
 */
export function f2Equals(first: Fixed2, second: Fixed2): boolean {
  return first.value === second.value
}

/**
 * Compares two Fixed2 values.
 * Returns a negative number if first < second, zero if first === second, or a positive number if first > second.
 * Useful for sorting and comparison operations.
 * For example:
 * compareFixed2(fixed2(700), fixed2(800)) < 0 (7.00 < 8.00)
 * compareFixed2(fixed2(800), fixed2(700)) > 0 (8.00 > 7.00)
 * compareFixed2(fixed2(700), fixed2(700)) === 0 (7.00 === 7.00)
 */
export function f2Compare(first: Fixed2, second: Fixed2): number {
  return first.value - second.value
}

/**
 * Checks if the first Fixed2 value is less than the second.
 * For example:
 * isLessThanFixed2(fixed2(700), fixed2(800)) = true (7.00 < 8.00)
 * isLessThanFixed2(fixed2(800), fixed2(700)) = false (8.00 < 7.00 is false)
 */
export function f2lt(first: Fixed2, second: Fixed2): boolean {
  return first.value < second.value
}

/**
 * Creates a Fixed2 value from a number.
 * Use this when you have a raw number that represents a fixed-point value in this format.
 * For example: fixed2(700) represents 7.00
 * @internal
 */
function fixed2(value: number): Fixed2 {
  return { value, kind: 'Fixed2' }
}

// KJA recommended by composer 1
// export function multF2(first: Fixed2, second: Fixed2): Fixed2 {
//   return fixed2(Math.round((first.value * second.value) / 100))
// }
