import { roundToF6, type Fixed6 } from '../primitives/fixed6Primitives'
import { assertMax6Dec } from './assertUtils'

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
