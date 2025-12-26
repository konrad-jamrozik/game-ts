import { f6lt, f6gt, f6le, f6ge, f6eq, f6c0, toF, type Fixed6 } from './fixed6'

/**
 * Asserts that a Fixed6 value is above zero.
 * For example:
 * f6assertAboveZero(toF6(1)) = passes
 * f6assertAboveZero(toF6(0)) = throws error
 * f6assertAboveZero(toF6(-1)) = throws error
 */
export function f6assertAboveZero(value: Fixed6, errMsg?: string): asserts value is Fixed6 {
  if (!f6gt(value, f6c0)) {
    const defaultMsg = `Value must be above 0, got: ${toF(value)}`
    throw new Error(errMsg ?? defaultMsg)
  }
}

/**
 * Asserts that the first Fixed6 value is less than the second.
 * For example:
 * f6assertLessThan(toF6(1), toF6(2)) = passes
 * f6assertLessThan(toF6(2), toF6(1)) = throws error
 * f6assertLessThan(toF6(1), toF6(1)) = throws error
 */
export function f6assertLessThan(left: Fixed6, right: Fixed6, errMsg?: string): asserts left is Fixed6 {
  if (!f6lt(left, right)) {
    const defaultMsg = `Left value must be less than right value, got: ${toF(left)} >= ${toF(right)}`
    throw new Error(errMsg ?? defaultMsg)
  }
}

/**
 * Asserts that two Fixed6 values are equal.
 * For example:
 * f6assertEqual(toF6(1), toF6(1)) = passes
 * f6assertEqual(toF6(1), toF6(2)) = throws error
 */
export function f6assertEqual(left: Fixed6, right: Fixed6, errMsg?: string): asserts left is Fixed6 {
  if (!f6eq(left, right)) {
    const defaultMsg = `Values must be equal, got: ${toF(left)} !== ${toF(right)}`
    throw new Error(errMsg ?? defaultMsg)
  }
}

/**
 * Asserts that the first Fixed6 value is less than or equal to the second.
 * For example:
 * f6assertLessThanOrEqual(toF6(1), toF6(2)) = passes
 * f6assertLessThanOrEqual(toF6(1), toF6(1)) = passes
 * f6assertLessThanOrEqual(toF6(2), toF6(1)) = throws error
 */
export function f6assertLessThanOrEqual(left: Fixed6, right: Fixed6, errMsg?: string): asserts left is Fixed6 {
  if (!f6le(left, right)) {
    const defaultMsg = `Left value must be less than or equal to right value, got: ${toF(left)} > ${toF(right)}`
    throw new Error(errMsg ?? defaultMsg)
  }
}

/**
 * Asserts that the first Fixed6 value is greater than the second.
 * For example:
 * f6assertGreaterThan(toF6(2), toF6(1)) = passes
 * f6assertGreaterThan(toF6(1), toF6(1)) = throws error
 * f6assertGreaterThan(toF6(1), toF6(2)) = throws error
 */
export function f6assertGreaterThan(left: Fixed6, right: Fixed6, errMsg?: string): asserts left is Fixed6 {
  if (!f6gt(left, right)) {
    const defaultMsg = `Left value must be greater than right value, got: ${toF(left)} <= ${toF(right)}`
    throw new Error(errMsg ?? defaultMsg)
  }
}

/**
 * Asserts that the first Fixed6 value is greater than or equal to the second.
 * For example:
 * f6assertGreaterThanOrEqual(toF6(2), toF6(1)) = passes
 * f6assertGreaterThanOrEqual(toF6(1), toF6(1)) = passes
 * f6assertGreaterThanOrEqual(toF6(1), toF6(2)) = throws error
 */
export function f6assertGreaterThanOrEqual(left: Fixed6, right: Fixed6, errMsg?: string): asserts left is Fixed6 {
  if (!f6ge(left, right)) {
    const defaultMsg = `Left value must be greater than or equal to right value, got: ${toF(left)} < ${toF(right)}`
    throw new Error(errMsg ?? defaultMsg)
  }
}

/**
 * Asserts that a Fixed6 value is non-negative (>= 0).
 * For example:
 * f6assertNonNeg(toF6(0)) = passes
 * f6assertNonNeg(toF6(1)) = passes
 * f6assertNonNeg(toF6(-1)) = throws error
 */
export function f6assertNonNeg(value: Fixed6, errMsg?: string): asserts value is Fixed6 {
  if (!f6ge(value, f6c0)) {
    const defaultMsg = `Value must be non-negative, got: ${toF(value)}`
    throw new Error(errMsg ?? defaultMsg)
  }
}
