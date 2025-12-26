import { f6lt, f6gt, f6c0, toF, type Fixed6 } from './fixed6'

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
