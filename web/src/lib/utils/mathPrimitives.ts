import { assertNotZero } from '../primitives/assertPrimitives'

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
  assertNotZero(denominator)
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
