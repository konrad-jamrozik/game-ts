/**
 * Represents a percentage value stored as an integer in basis points where 100 = 1%.
 * For example: 100 represents 1.00%, 10,000 represents 100.00%
 *
 * This type is used for panic, threat level, suppression, and related values
 * throughout the game state.
 */
export type Bps = number & { readonly __brand: 'Bps' }

/**
 * Creates a Bps value from a number.
 * Use this when you have a raw number that represents a percentage in this format.
 */
export function bps(value: number): Bps {
  // KJA fix squiggly
  return value as Bps
}

/**
 * Creates a Bps value from an actual percentage (e.g., 1.5 for 1.5%).
 * Multiplies by 100 to convert to the stored format.
 */
export function bpsFromPercent(percent: number): Bps {
  // KJA fix squiggly
  return Math.round(percent * 100) as Bps
}
