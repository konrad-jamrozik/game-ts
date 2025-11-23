import { floor } from '../utils/mathUtils'

/**
 * Represents a fixed-point number with 2 decimal places precision.
 * For example: 700 represents 7.00, 110 represents 1.10, 2150 represents 21.50
 *
 * This type is used for agent skill values throughout the game state.
 */
export type Fixed2 = {
  readonly value: number
  readonly kind: 'Fixed2'
}

/**
 * Creates a Fixed2 value from a number.
 * Use this when you have a raw number that represents a fixed-point value in this format.
 * For example: fixed2(700) represents 7.00
 */
export function fixed2(value: number): Fixed2 {
  return { value, kind: 'Fixed2' }
}

export function isFixed2(value: unknown): value is Fixed2 {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === 'Fixed2' &&
    'value' in value &&
    typeof value.value === 'number'
  )
}

/**
 * Converts a decimal value to Fixed2 format by multiplying by 100.
 * For example:
 * toFixed2(7) = fixed2(700)
 * toFixed2(1.1) = fixed2(110)
 * toFixed2(21.75) = fixed2(2175)
 */
export function toFixed2(value: number): Fixed2 {
  return fixed2(value * 100)
}

/**
 * Converts a Fixed2 value to an integer by dividing by 100 and rounding down.
 * For example:
 * fromFixed2(fixed2(700)) = 7
 * fromFixed2(fixed2(2150)) = 21 (not 21.5)
 * fromFixed2(fixed2(2175)) = 21 (not 21.75)
 */
export function fromFixed2(fixed: Fixed2): number {
  return floor(fixed.value / 100)
}

/**
 * Converts a Fixed2 value to a decimal number without rounding.
 * For example:
 * fromFixed2Decimal(fixed2(700)) = 7.0
 * fromFixed2Decimal(fixed2(2150)) = 21.5
 * fromFixed2Decimal(fixed2(2175)) = 21.75
 */
export function fromFixed2Decimal(fixed: Fixed2): number {
  return fixed.value / 100
}

/**
 * Rounds down a Fixed2 value to the nearest integer (maintaining 2 decimal precision).
 * For example:
 * floorFixed2(fixed2(2175.9)) = fixed2(2175) (representing 21.75)
 * floorFixed2(fixed2(2150.7)) = fixed2(2150) (representing 21.50)
 */
export function floorFixed2(fixed: Fixed2): Fixed2 {
  return fixed2(floor(fixed.value))
}

/**
 * Adds two Fixed2 values together.
 * For example:
 * addFixed2(fixed2(700), fixed2(300)) = fixed2(1000) (representing 7.00 + 3.00 = 10.00)
 */
export function addFixed2(first: Fixed2, second: Fixed2): Fixed2 {
  return fixed2(first.value + second.value)
}

/**
 * Checks if two Fixed2 values are equal.
 * For example:
 * equalsFixed2(fixed2(700), fixed2(700)) = true
 * equalsFixed2(fixed2(700), fixed2(701)) = false
 */
export function equalsFixed2(first: Fixed2, second: Fixed2): boolean {
  return first.value === second.value
}

/**
 * Compares two Fixed2 values.
 * Returns a negative number if first < second, zero if first === second, or a positive number if first > second.
 * Useful for sorting and comparison operations.
 * For example:
 * compareFixed2(fixed2(700), fixed2(800)) < 0 (7.00 < 8.00)
 * compareFixed2(fixed2(800), fixed2(700)) > 0 (8.00 > 7.00)
 * compareFixed2(fixed2(700), fixed2(700)) === 0 (7.00 === 7.00)
 */
export function compareFixed2(first: Fixed2, second: Fixed2): number {
  return first.value - second.value
}

/**
 * Checks if the first Fixed2 value is less than the second.
 * For example:
 * isLessThanFixed2(fixed2(700), fixed2(800)) = true (7.00 < 8.00)
 * isLessThanFixed2(fixed2(800), fixed2(700)) = false (8.00 < 7.00 is false)
 */
export function isLessThanFixed2(first: Fixed2, second: Fixed2): boolean {
  return first.value < second.value
}
