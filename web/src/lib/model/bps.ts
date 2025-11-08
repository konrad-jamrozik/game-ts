import { fmtPctDiv100Dec2 } from '../utils/formatUtils'

/**
 * Represents a percentage value stored as an integer in basis points where 100 = 1%.
 * For example: 100 represents 1.00%, 10,000 represents 100.00%
 *
 * This type is used for panic, threat level, suppression, and related values
 * throughout the game state.
 */
export type Bps = number & { readonly __brand: 'BasisPoints' }

/**
 * Creates a Bps value from a number.
 * Use this when you have a raw number that represents a percentage in this format.
 */
export function bps(value: number): Bps {
  // We must disable the type assertion here because we are creating a new Bps value.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return value as Bps
}

export function isBps(value: unknown): value is Bps {
  // KJA actually busted, branded type cannot have runtime checks
  return typeof value === 'number' && value.constructor.name === 'Bps'
}

export function bpsStr(value: Bps): string {
  // kja use bpsStr everywhere instead of str
  return fmtPctDiv100Dec2(value)
}
