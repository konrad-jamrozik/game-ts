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
