import { sum } from 'radash'
import { assertInRange, assertInteger, assertMax6Dec } from './assertPrimitives'
import { dist, div, floor } from './mathPrimitives'
import { fmtDec0, fmtDec1, fmtDec2, fmtPctDec0, fmtPctDec2 } from './formatPrimitives'

export const FIXED4_PRECISION = 10_000

/**
 * Represents a fixed-point number with 6 decimal places precision.
 * Internally stored as an integer where 1 = 0.000001 (one millionth).
 * For example: 1_000_000 represents 1.00, 1_100_000 represents 1.10, 21_500_000 represents 21.50
 *
 * This type is used for all fractional numbers throughout the game state.
 */
export type Fixed6 = {
  readonly value: number
  readonly kind: 'Fixed6'
}

export function isF6(value: unknown): value is Fixed6 {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === 'Fixed6' &&
    'value' in value &&
    typeof value.value === 'number'
  )
}

/**
 * Converts a decimal value to Fixed6 format by rounding to 6 decimal places.
 * If you want to conversion that guarantees no loss of precision, use toF6 instead.
 */
export function toF6r(value: number): Fixed6 {
  return roundToF6(value)
}

/**
 * Converts a Fixed6 value to a decimal number without rounding.
 * For example:
 * asFloat(fixed6(7_000_000)) = 7.0
 * asFloat(fixed6(21_500_000)) = 21.5
 * asFloat(fixed6(21_750_000)) = 21.75
 */
export function toF(fixed: Fixed6): number {
  return fixed.value / 1_000_000
}

export function f6sub(first: Fixed6, second: Fixed6): Fixed6 {
  return fixed6(first.value - second.value)
}

export function f6abs(value: Fixed6): Fixed6 {
  return fixed6(Math.abs(value.value))
}

export function f6dist(first: Fixed6, second: Fixed6): Fixed6 {
  return fixed6(dist(first.value, second.value))
}

export function f6max(first: Fixed6, second: Fixed6): Fixed6 {
  return fixed6(Math.max(first.value, second.value))
}

export function f6min(first: Fixed6, second: Fixed6): Fixed6 {
  return fixed6(Math.min(first.value, second.value))
}

/**
 * Multiplies a Fixed6 value by zero or more decimal numbers and returns the result as a number.
 * For example:
 * f6mult(fixed6(10_000_000)) = 10.00 (representing 10.00 * 1 = 10.00, no multipliers)
 * f6mult(fixed6(10_000_000), 0.2) = 2.00 (representing 10.00 * 0.2 = 2.00)
 * f6mult(fixed6(10_000_000), 0.5, 0.8) = 4.00 (representing 10.00 * 0.5 * 0.8 = 4.00)
 * f6mult(fixed6(21_500_000), 0.9, 0.95) = 18.3825 (representing 21.50 * 0.9 * 0.95 = 18.3825)
 */
export function f6mult(first: Fixed6, ...multipliers: number[]): number {
  const product = multipliers.reduce((acc, mult) => acc * mult, toF(first))
  return product
}

export function f6div(numerator: Fixed6, denominator: Fixed6): number {
  return div(numerator.value, denominator.value)
}

/**
 * Sums one or more Fixed6 values together and returns the result as a Fixed6.
 * For example:
 * f6sum(fixed6(7_000_000), fixed6(3_000_000)) = fixed6(10_000_000) (representing 7.00 + 3.00 = 10.00)
 * f6sum(fixed6(1_000_000), fixed6(2_000_000), fixed6(3_000_000)) = fixed6(6_000_000) (representing 1.00 + 2.00 + 3.00 = 6.00)
 * f6sum(...arrayOfFixed6) = sum of all values in the array
 */
export function f6sum(...values: Fixed6[]): Fixed6 {
  const sumRes = sum(values, (value) => value.value)
  return fixed6(sumRes)
}

/**
 * Checks if two Fixed6 values are equal.
 * For example:
 * f6eq(fixed6(7_000_000), fixed6(7_000_000)) = true
 * f6eq(fixed6(7_000_000), fixed6(7_000_001)) = false
 */
export function f6eq(first: Fixed6, second: Fixed6): boolean {
  return first.value === second.value
}

/**
 * Checks if a Fixed6 value is zero.
 * For example:
 * f6isZero(fixed6(0)) = true
 * f6isZero(asF6(0)) = true
 * f6isZero(fixed6(7_000_000)) = false
 */
export function f6isZero(value: Fixed6): boolean {
  return value.value === 0
}

/**
 * Compares two Fixed6 values.
 * Returns a negative number if first < second, zero if first === second, or a positive number if first > second.
 * Useful for sorting and comparison operations.
 * For example:
 * f6cmp(fixed6(7_000_000), fixed6(8_000_000)) < 0 (7.00 < 8.00)
 * f6cmp(fixed6(8_000_000), fixed6(7_000_000)) > 0 (8.00 > 7.00)
 * f6cmp(fixed6(7_000_000), fixed6(7_000_000)) === 0 (7.00 === 7.00)
 */
export function f6cmp(first: Fixed6, second: Fixed6): number {
  return first.value - second.value
}

/**
 * Checks if the first Fixed6 value is less than the second.
 * For example:
 * f6lt(fixed6(7_000_000), fixed6(8_000_000)) = true (7.00 < 8.00)
 * f6lt(fixed6(8_000_000), fixed6(7_000_000)) = false (8.00 < 7.00 is false)
 */
export function f6lt(first: Fixed6, second: Fixed6): boolean {
  return first.value < second.value
}

export function f6le(first: Fixed6, second: Fixed6): boolean {
  return first.value <= second.value
}

/**
 * Checks if the first Fixed6 value is greater than or equal to the second.
 * For example:
 * f6ge(fixed6(8_000_000), fixed6(7_000_000)) = true (8.00 >= 7.00)
 * f6ge(fixed6(7_000_000), fixed6(8_000_000)) = false (7.00 >= 8.00 is false)
 * f6ge(fixed6(7_000_000), fixed6(7_000_000)) = true (7.00 >= 7.00)
 */
export function f6ge(first: Fixed6, second: Fixed6): boolean {
  return first.value >= second.value
}

/**
 * Checks if a Fixed6 value is within a range (inclusive on both ends).
 * For example:
 * f6inRange(fixed6(5_000_000), fixed6(4_000_000), fixed6(6_000_000)) = true (5.00 is between 4.00 and 6.00)
 * f6inRange(fixed6(4_000_000), fixed6(4_000_000), fixed6(6_000_000)) = true (4.00 is at lower bound)
 * f6inRange(fixed6(6_000_000), fixed6(4_000_000), fixed6(6_000_000)) = true (6.00 is at upper bound)
 * f6inRange(fixed6(3_000_000), fixed6(4_000_000), fixed6(6_000_000)) = false (3.00 is below range)
 * f6inRange(fixed6(7_000_000), fixed6(4_000_000), fixed6(6_000_000)) = false (7.00 is above range)
 */
export function f6inRange(value: Fixed6, lowerBound: Fixed6, upperBound: Fixed6): boolean {
  return f6ge(value, lowerBound) && f6le(value, upperBound)
}

/**
 * Converts a decimal number to a Fixed6 value by flooring to 6 decimal places.
 * For example:
 * floorToF6(7.123456789) = fixed6(7_123_456) (7.123456)
 * floorToF6(7.999999999) = fixed6(7_999_999) (7.999999)
 * floorToF6(7.0) = fixed6(7_000_000) (7.000000)
 */
export function floorToF6(value: number): Fixed6 {
  const floored = floor(value * 1_000_000)
  return fixed6(floored)
}

export function roundToF6(value: number): Fixed6 {
  const rounded = Math.round(value * 1_000_000)
  return fixed6(rounded)
}

export function roundToF4(value: number): Fixed6 {
  const rounded = Math.round(value * 10_000)
  return f6fromF4(rounded)
}

export function f6fromF4(value: number): Fixed6 {
  assertInRange(value, 0, FIXED4_PRECISION)
  return fixed6(value * 100)
}

export function f6floorToInt(value: Fixed6): number {
  const floored = floor(toF(value))
  assertInteger(floored)
  return floored
}

/**
 * Creates a Fixed6 value from a number.
 * Use this when you have a raw number that represents a fixed-point value in this format.
 * For example:
 * fixed6(7_000_000) represents 7.000000
 * fixed6(70_000_000) represents 70.000000
 * fixed6(7) represents 0.000007
 * fixed6(7.7) throws an error
 * @internal
 */
export function fixed6(value: number): Fixed6 {
  assertInteger(value)
  return { value, kind: 'Fixed6' }
}

/**
 * Converts a decimal value to Fixed6 format.
 * It asserts the converted value has no more decimal places than 6.
 * As such, it guarantees no loss of precision.
 * If you need to convert a value to Fixed6 format with rounding,
 * use toF6r instead.
 *
 * For example:
 * asF6(7) creates fixed6(7_000_000), which represents 7.000000.
 * asF6(1.1) creates fixed6(1_100_000), which represents 1.100000.
 * asF6(21.75) creates fixed6(21_750_000), which represents 21.750000.
 * asF6(21.758123456) creates fixed6(21_758_123), which represents 21.758123 (floored to 6 decimals).
 */
export function toF6(value: number): Fixed6 {
  assertMax6Dec(value)
  // We still round here instead of doing toF6 because assertMax6Dec allows for a tolerance of 1e-8,
  // which should be removed by this rounding.
  return roundToF6(value)
}

/**
 * Converts a Fixed6 value to an integer string by dividing by 1_000_000 and rounding down.
 * Use this when you want to display a Fixed6 value as a plain integer number.
 *
 * For example:
 * f6fmtInt(fixed6(7_000_000)) = "7"
 * f6fmtInt(fixed6(21_500_000)) = "21" (not "21.5")
 * f6fmtInt(fixed6(21_750_000)) = "21" (not "21.75")
 */
export function f6fmtInt(value: Fixed6): string {
  return fmtDec0(toF(value))
}

export function f6fmtDec1(value: Fixed6): string {
  return fmtDec1(toF(value))
}

export function f6fmtDec2(value: Fixed6): string {
  return fmtDec2(toF(value))
}

/**
 * Formats a Fixed6 value as a percentage with 2 decimal places, after dividing it by the denominator.
 * For example:
 * f6fmtPctDec2(asF6(75), asF6(100)) = "75.00" (representing 75.00%)
 * f6fmtPctDec2(asF6(98.5), asF6(52)) = "189.42" (representing 189.42%)
 */
export function f6fmtPctDec2(nominator: Fixed6, denominator: Fixed6 | number = 1): string {
  const denominatorValue = isF6(denominator) ? denominator.value : toF6(denominator).value
  return fmtPctDec2(nominator.value, denominatorValue)
}

export function f6fmtPctDec0(nominator: Fixed6, denominator: Fixed6 | number = 1): string {
  const denominatorValue = isF6(denominator) ? denominator.value : toF6(denominator).value
  return fmtPctDec0(nominator.value, denominatorValue)
}

/**
 * Adds two Fixed6 values together.
 * For example:
 * f6add(fixed6(7_000_000), fixed6(3_000_000)) = fixed6(10_000_000) (representing 7.00 + 3.00 = 10.00)
 */
export function f6add(first: Fixed6, second: Fixed6 | number): Fixed6 {
  const secondValue = typeof second === 'number' ? toF6(second).value : second.value
  return fixed6(first.value + secondValue)
}

export function f6gt(first: Fixed6, second: Fixed6 | number): boolean {
  const secondValue = typeof second === 'number' ? toF6(second).value : second.value
  return first.value > secondValue
}
