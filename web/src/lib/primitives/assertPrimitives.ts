import { hasAtMostDecimals } from './mathPrimitives'

export function assertDefined<T>(
  value: T,
  errMsg = 'Value must be defined (not null or undefined)',
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(errMsg)
  }
}

export function assertEqual<T>(left: T, right: T, errMsg = 'Values must be equal'): asserts left is T & NonNullable<T> {
  if (left !== right) {
    throw new Error(errMsg)
  }
}

export function assertNotZero<T>(value: T, errMsg = 'Value must not be zero'): asserts value is T & NonNullable<T> {
  if (value === 0) {
    throw new Error(errMsg)
  }
}

export function assertInRange(
  value: number,
  min: number,
  max: number,
  errMsg = 'Value must be between min and max',
): asserts value is number {
  if (value < min || value > max) {
    throw new Error(errMsg)
  }
}

export function assertOneOf<T>(
  value: T,
  validValues: readonly T[],
  errMsg = 'Value must be one of the valid options',
): asserts value is T & NonNullable<T> {
  if (!validValues.includes(value)) {
    throw new Error(errMsg)
  }
}

export function assertNotIn<T>(
  value: T,
  array: readonly T[] | T[],
  errMsg = 'Value must not be in the array',
): asserts value is T {
  if (array.includes(value)) {
    throw new Error(errMsg)
  }
}

export function assertNotEmpty<T>(value: T[], errMsg = 'Value must not be empty'): asserts value is T[] {
  if (value.length === 0) {
    throw new Error(errMsg)
  }
}

export function assertNotNaN(value: number, errMsg = 'Value must not be NaN'): asserts value is number {
  if (Number.isNaN(value)) {
    throw new TypeError(errMsg)
  }
}

export function assertUnreachable(value: never): never {
  throw new Error(`Unreachable code reached. Received: ${JSON.stringify(value)}`)
}

export function assertNonNeg(value: number, errMsg = 'Value must be non-negative'): number {
  if (value < 0) {
    throw new Error(errMsg)
  }
  return value
}

export function assertAboveZero(value: number, errMsg = 'Value must be above zero'): asserts value is number {
  if (value <= 0) {
    throw new Error(errMsg)
  }
}

export function assertLessThan(
  left: number,
  right: number,
  errMsg = 'Left value must be less than right value',
): asserts left is number {
  if (left >= right) {
    throw new Error(errMsg)
  }
}

export function assertInteger(
  value: number,
  errMsg = `Value must be an integer, got: ${value}`,
): asserts value is number {
  if (!Number.isInteger(value)) {
    throw new TypeError(errMsg)
  }
}

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
