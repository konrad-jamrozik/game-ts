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
