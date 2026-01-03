/**
 * A floor that adds a small tolerance to handle floating point precision issues before flooring.
 * Refer to tests for this function for details.
 */
export function floor(value: number): number {
  // Add a small tolerance to handle floating point precision issues before flooring
  // Note: This floor function is not doing the "-0" fix done by the ceil function
  // as it would be needed only in cases where we expect from the floor function to return -0.
  // This should never be the case - we should never want to explicitly have -0 anywhere.
  return Math.floor(value + 1e-9)
}

/**
 * A ceil that subtracts a small tolerance to handle floating point precision issues before ceiling.
 * Refer to tests for this function for details.
 */
export function ceil(value: number): number {
  // Subtract a small tolerance to handle floating point precision issues before ceiling
  // Note: Object.is check is required for the case when value is < 1e-10, including if it is 0.
  // Without it, the function would return -0, which would fail .toBe() tests from vitest,
  // as they use Object.is():
  // Object.is( 0, 0) -> true
  // Object.is(-0, 0) -> false
  let res = Math.ceil(value - 1e-9)
  res = Object.is(res, -0) ? 0 : res
  return res
}

export function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

export function div(nominator: number, denominator: number): number {
  if (denominator === 0) {
    // Note: cannot use a function from assertPrimitives.ts here. This would cause a circular dependency:
    // mathPrimitives depends on assertPrimitives for assertNotZero
    // assertPrimitives depends on mathPrimitives for hasAtMostDecimals
    throw new Error('Denominator must not be zero')
  }
  return nominator / denominator
}

export function toPct(value: number, denominator = 1): number {
  return div(value * 100, denominator)
}

export function nonNeg(value: number): number {
  return Math.max(0, value)
}

export function dist(first: number, second: number): number {
  return Math.abs(first - second)
}

export function floorToDec1(value: number): number {
  return floor(value * 10) / 10
}

export function floorToDec2(value: number): number {
  return floor(value * 100) / 100
}

export function floorToDec4(value: number): number {
  return floor(value * 10_000) / 10_000
}

export function floorToDec6(value: number): number {
  return floor(value * 1_000_000) / 1_000_000
}

export function roundToDec4(value: number): number {
  return Math.round(value * 10_000) / 10_000
}

/**
 * Checks if a number has at most X decimal places.
 * Uses a tolerance to handle floating point precision issues.
 * @param value - The number to check
 * @param decimalPlaces - Maximum number of decimal places allowed
 * @returns true if the value has at most X decimal places, false otherwise
 */
export function hasAtMostDecimals(value: number, decimalPlaces: number): boolean {
  const multiplier = 10 ** decimalPlaces
  const multiplied = Math.abs(value * multiplier)
  const floored = floor(multiplied)
  // Use a tolerance to handle floating point precision issues
  // If the difference is less than 1e-8, consider them equal
  return Math.abs(multiplied - floored) <= 1e-8
}

// KJA3 should I use some math lib for quantileSorted?
/**
 * Calculates the quantile (percentile) of a sorted array using linear interpolation.
 *
 * For example, if q=0.3 (30th percentile), this returns the value such that 30% of the data
 * falls at or below it. The returned value represents the boundary: values less than this
 * are below the 30th percentile, values greater than or equal to this are at or above it.
 *
 * Refer to unit tests for more examples.
 *
 * @param sortedAscending - Array of numbers sorted in ascending order
 * @param q - Quantile to calculate (0.0 to 1.0, where 0.5 is median, 0.9 is 90th percentile)
 * @returns The interpolated value at the specified quantile boundary
 */
export function quantileSorted(sortedAscending: readonly number[], q: number): number {
  if (sortedAscending.length === 0) {
    return 0
  }
  if (sortedAscending.length === 1) {
    return sortedAscending[0] ?? 0
  }

  const clampedQ = Math.min(1, Math.max(0, q))
  const pos = (sortedAscending.length - 1) * clampedQ
  const lower = Math.floor(pos)
  const upper = Math.ceil(pos)
  const weight = pos - lower

  const lowerVal = sortedAscending[lower] ?? 0
  const upperVal = sortedAscending[upper] ?? lowerVal
  return lowerVal + (upperVal - lowerVal) * weight
}
