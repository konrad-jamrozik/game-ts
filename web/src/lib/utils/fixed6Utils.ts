import { roundToF6, toF, isF6, fixed6, type Fixed6 } from '../primitives/fixed6Primitives'
import { assertMax6Dec } from './assertUtils'
import { fmtDec0, fmtDec1, fmtDec2, fmtPctDec0, fmtPctDec2 } from '../primitives/formatPrimitives'

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
