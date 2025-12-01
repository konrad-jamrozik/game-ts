import { hasAtMostDecimals } from '../primitives/mathPrimitives'

/**
 * Asserts that a number has at most 2 decimal places.
 * For example:
 * assertMax2Dec(100) = true
 * assertMax2Dec(100.1) = true
 * assertMax2Dec(100.12) = true
 * assertMax2Dec(100.1200) = true
 * assertMax2Dec(100.123) = false
 * assertMax2Dec(100.120001) = false
 */
export function assertMax2Dec(
  value: number,
  errMsg = `Value must have at most 2 decimal places, got: ${value}`,
): asserts value is number {
  if (!hasAtMostDecimals(value, 2)) {
    throw new Error(errMsg)
  }
}

export function assertMax4Dec(
  value: number,
  errMsg = `Value must have at most 4 decimal places, got: ${value}`,
): asserts value is number {
  if (!hasAtMostDecimals(value, 4)) {
    throw new Error(errMsg)
  }
}

export function assertMax6Dec(
  value: number,
  errMsg = `Value must have at most 6 decimal places, got: ${value}`,
): asserts value is number {
  if (!hasAtMostDecimals(value, 6)) {
    throw new Error(errMsg)
  }
}
