/**
 * Calculates panic increase from faction threat level and suppression.
 *
 * Formula: Math.max(0, threatLevel - suppression)
 *
 * This is the source of truth for panic increase calculation.
 *
 * @param threatLevel - The faction's threat level
 * @param suppression - The faction's suppression value
 * @returns The panic increase (never negative)
 */
export function calculatePanicIncrease(threatLevel: number, suppression: number): number {
  return Math.max(0, threatLevel - suppression)
}
