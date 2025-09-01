/**
 * A floor that adds a small tolerance to handle floating point precision issues before flooring.
 *
 * For example, Math,floor(100 * 0.2) would result in Math.floor(19.999999999999996) == 19, instead of 20.
 *
 */
export function floor(value: number): number {
  // Add a small tolerance (1e-10) to handle floating point precision issues before flooring
  return Math.floor(value + 1e-10)
}

/**
 * Rounds down given value to given precision, then returns it as integer.
 *
 *
 * For example:
 * toPrecisionRoundingDown(0.1278,     100) ->   12
 * toPrecisionRoundingDown(0.12348, 10_000) -> 1234
 * toPrecisionRoundingDown(0.99999, 10_000) -> 9999
 *
 * @param value - The value to round
 * @param precision - The precision to round to
 * @returns The rounded value
 */
export function toPrecisionRoundingDown(value: number, precision: number): number {
  return floor(value * precision)
}
