import type { Bps } from '../model/bps'

/**
 * Calculates panic increase from faction threat level and suppression.
 *
 * Formula: Math.max(0, threatLevel - suppression)
 *
 * This is the source of truth for panic increase calculation.
 *
 * @param threatLevel - The faction's threat level (in basis points)
 * @param suppression - The faction's suppression value (in basis points)
 * @returns The panic increase (never negative, in basis points)
 */
export function calculatePanicIncrease(threatLevel: Bps, suppression: Bps): Bps {
  // KJA fix squiggly
  return Math.max(0, threatLevel - suppression) as Bps
}
