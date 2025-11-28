import { sum } from 'radash'
import { assertInteger, assertMax2Dec } from '../utils/assert'
import { fmtDec0, fmtDec1, fmtDec2, fmtPctDec0, fmtPctDec2 } from '../utils/formatUtils'
import { dist, floor, mult100flr } from '../utils/mathUtils'

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
  return toF2flr(value)
}

function toF2flr(value: number): Fixed2 {
  return fixed2(mult100flr(value))
}

export function f2addToInt(target: number, value: Fixed2): number {
  return f2asInt(f2add(toF2(target), value))
}

function f2asInt(value: Fixed2): number {
  return floor(f2asFloat(value))
}

/**
 * // KJA review all usages of f2AsFloat
 * Converts a Fixed2 value to a decimal number without rounding.
 * For example:
 * f2asFloat(fixed2(700)) = 7.0
 * f2asFloat(fixed2(2150)) = 21.5
 * f2asFloat(fixed2(2175)) = 21.75
 */
export function f2asFloat(fixed: Fixed2): number {
  return fixed.value / 100
}

/**
 * Converts a Fixed2 value to an integer string by dividing by 100 and rounding down.
 * Use this when you want to display a Fixed2 value as a plain integer number.
 *
 * For example:
 * f2fmtInt(fixed2(700)) = "7"
 * f2fmtInt(fixed2(2150)) = "21" (not "21.5")
 * f2fmtInt(fixed2(2175)) = "21" (not "21.75")
 *
 */
export function f2fmtInt(value: Fixed2): string {
  return fmtDec0(f2asFloat(value))
}

export function f2fmtDec1(value: Fixed2): string {
  return fmtDec1(f2asFloat(value))
}

export function f2fmt(value: Fixed2): string {
  return fmtDec2(f2asFloat(value))
}
/**
 * Formats a Fixed2 value as a percentage with 2 decimal places, comparing it to a denominator.
 * For example:
 * f2fmtPctDec2(toF2(75), toF2(100)) = "75.00" (representing 75.00%)
 * f2fmtPctDec2(toF2(98.5), toF2(52)) = "189.42" (representing 189.42%)
 */
export function f2fmtPctDec2(nominator: Fixed2, denominator: Fixed2 | number | undefined = undefined): string {
  if (isF2(denominator)) {
    return fmtPctDec2(nominator.value, denominator.value)
  }
  if (typeof denominator === 'number') {
    return fmtPctDec2(nominator.value, toF2(denominator).value)
  }
  return fmtPctDec2(f2asFloat(nominator))
}

export function f2fmtPctDec0(nominator: Fixed2, denominator: Fixed2 | number | undefined = undefined): string {
  if (isF2(denominator)) {
    return fmtPctDec0(nominator.value, denominator.value)
  }
  if (typeof denominator === 'number') {
    return fmtPctDec0(nominator.value, toF2(denominator).value)
  }
  return fmtPctDec0(f2asFloat(nominator))
}

/**
 * Adds two Fixed2 values together.
 * For example:
 * f2add(fixed2(700), fixed2(300)) = fixed2(1000) (representing 7.00 + 3.00 = 10.00)
 */
export function f2add(first: Fixed2, second: Fixed2 | number): Fixed2 {
  const secondValue = typeof second === 'number' ? toF2(second).value : second.value
  return fixed2(first.value + secondValue)
}

export function f2sub(first: Fixed2, second: Fixed2): Fixed2 {
  return fixed2(first.value - second.value)
}

export function f2abs(value: Fixed2): Fixed2 {
  return fixed2(Math.abs(value.value))
}

export function f2dist(first: Fixed2, second: Fixed2): Fixed2 {
  return fixed2(dist(first.value, second.value))
}

/**
 * Multiplies a Fixed2 value by one or more decimal numbers and returns the result as a Fixed2.
 * The result is floored to maintain Fixed2 precision.
 * For example:
 * f2mult(fixed2(1000), 0.2) = fixed2(200) (representing 10.00 * 0.2 = 2.00)
 * f2mult(fixed2(1000), 0.5, 0.8) = fixed2(400) (representing 10.00 * 0.5 * 0.8 = 4.00)
 * f2mult(fixed2(2150), 0.9, 0.95) = fixed2(1838) (representing 21.50 * 0.9 * 0.95 = 18.3825, floored to 18.38)
 */
export function f2mult(first: Fixed2, ...multipliers: number[]): Fixed2 {
  const product = multipliers.reduce((acc, mult) => acc * mult, f2asFloat(first))
  return toF2flr(product)
}

/**
 * Divides one Fixed2 value by another and returns the result as a Fixed2.
 * The result represents the ratio directly (not as a percentage).
 * For example:
 * f2div(fixed2(800), fixed2(1000)) = fixed2(80) (representing 8.00 / 10.00 = 0.80)
 * f2div(fixed2(1500), fixed2(1000)) = fixed2(150) (representing 15.00 / 10.00 = 1.50)
 */
export function f2div(numerator: Fixed2, denominator: Fixed2 | number): Fixed2 {
  const denominatorValue = typeof denominator === 'number' ? toF2(denominator).value : denominator.value
  const ratio = numerator.value / denominatorValue
  return toF2flr(ratio)
}

/**
 * Sums one or more Fixed2 values together and returns the result as a Fixed2.
 * For example:
 * f2sum(fixed2(700), fixed2(300)) = fixed2(1000) (representing 7.00 + 3.00 = 10.00)
 * f2sum(fixed2(100), fixed2(200), fixed2(300)) = fixed2(600) (representing 1.00 + 2.00 + 3.00 = 6.00)
 * f2sum(...arrayOfFixed2) = sum of all values in the array
 */
export function f2sum(...values: Fixed2[]): Fixed2 {
  const sumRes = sum(values, (value) => value.value)
  return fixed2(sumRes)
}

/**
 * Checks if two Fixed2 values are equal.
 * For example:
 * f2eq(fixed2(700), fixed2(700)) = true
 * f2eq(fixed2(700), fixed2(701)) = false
 */
export function f2eq(first: Fixed2, second: Fixed2): boolean {
  return first.value === second.value
}

/**
 * Checks if a Fixed2 value is zero.
 * For example:
 * f2isZero(fixed2(0)) = true
 * f2isZero(toF2(0)) = true
 * f2isZero(fixed2(700)) = false
 */
export function f2isZero(value: Fixed2): boolean {
  return value.value === 0
}

/**
 * Compares two Fixed2 values.
 * Returns a negative number if first < second, zero if first === second, or a positive number if first > second.
 * Useful for sorting and comparison operations.
 * For example:
 * f2cmp(fixed2(700), fixed2(800)) < 0 (7.00 < 8.00)
 * f2cmp(fixed2(800), fixed2(700)) > 0 (8.00 > 7.00)
 * f2cmp(fixed2(700), fixed2(700)) === 0 (7.00 === 7.00)
 */
export function f2cmp(first: Fixed2, second: Fixed2): number {
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

export function f2le(first: Fixed2, second: Fixed2): boolean {
  return first.value <= second.value
}

/**
 * Checks if a Fixed2 value is within a range (inclusive on both ends).
 * For example:
 * f2inRange(fixed2(500), fixed2(400), fixed2(600)) = true (5.00 is between 4.00 and 6.00)
 * f2inRange(fixed2(400), fixed2(400), fixed2(600)) = true (4.00 is at lower bound)
 * f2inRange(fixed2(600), fixed2(400), fixed2(600)) = true (6.00 is at upper bound)
 * f2inRange(fixed2(300), fixed2(400), fixed2(600)) = false (3.00 is below range)
 * f2inRange(fixed2(700), fixed2(400), fixed2(600)) = false (7.00 is above range)
 */
export function f2inRange(value: Fixed2, lowerBound: Fixed2, upperBound: Fixed2): boolean {
  return f2ge(value, lowerBound) && f2le(value, upperBound)
}

/**
 * Checks if the first Fixed2 value is greater than or equal to the second.
 * For example:
 * f2ge(fixed2(800), fixed2(700)) = true (8.00 >= 7.00)
 * f2ge(fixed2(700), fixed2(800)) = false (7.00 >= 8.00 is false)
 * f2ge(fixed2(700), fixed2(700)) = true (7.00 >= 7.00)
 */
export function f2ge(first: Fixed2, second: Fixed2): boolean {
  return first.value >= second.value
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
