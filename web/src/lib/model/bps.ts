/**
 * Represents a percentage value stored as an integer in basis points where 100 = 1%.
 * For example: 100 represents 1.00%, 10,000 represents 100.00%
 *
 * This type is used for panic, threat level, suppression, and related values
 * throughout the game state.
 */
export type Bps = {
  readonly value: number
  readonly kind: 'BasisPoints'
}

/**
 * Creates a Bps value from a number.
 * Use this when you have a raw number that represents a percentage in this format.
 */
export function bps(value: number): Bps {
  return { value, kind: 'BasisPoints' }
}

export function isBps(value: unknown): value is Bps {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === 'BasisPoints' &&
    'value' in value &&
    typeof value.value === 'number'
  )
}
