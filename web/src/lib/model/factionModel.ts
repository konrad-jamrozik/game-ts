import type { FactionId, FactionDataId } from './modelIds'

/**
 * Activity level progression values.
 * 0 = Dormant, 1 = Faint, 2 = Emerging, 3 = Active, 4 = Expanding, 5 = Escalating, 6 = War, 7 = Total War
 */
export type FactionActivityLevelOrd = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Operation level values.
 * 1 = Soft operations,
 * 2 = Violent but small-scale,
 * 3 = Strategic threats,
 * 4 = Regional destabilization,
 * 5 = Global conflict,
 * 6 = Existential
 */
export type FactionOperationLevelOrd = 1 | 2 | 3 | 4 | 5 | 6

export const ACTIVITY_LEVEL_NAMES = [
  'Dormant',
  'Faint',
  'Emerging',
  'Active',
  'Expanding',
  'Escalating',
  'War',
  'Total war',
] as const

export type FactionActivityLevelName = (typeof ACTIVITY_LEVEL_NAMES)[number]

export type Faction = {
  id: FactionId
  factionDataId: FactionDataId
  /**
   * Current activity level (0-7).
   * Determines faction operation frequency and strength.
   */
  activityLevel: FactionActivityLevelOrd
  /**
   * Number of turns at current activity level.
   * When this reaches the threshold for current level, activity level increases.
   */
  turnsAtCurrentLevel: number
  /**
   * Pre-rolled target number of turns needed to progress from current activity level.
   * This value is determined at game start or when advancing to a new level.
   */
  targetTurnsForProgression: number
  /**
   * Number of turns until next faction operation roll.
   * When this reaches 0, a faction operation occurs.
   */
  turnsUntilNextOperation: number
  /**
   * Number of suppression turns remaining.
   * Delays the next faction operation roll.
   */
  suppressionTurns: number
  /**
   * Name of the last defensive mission type spawned for this faction.
   * Used to prevent repeating the same operation type twice in a row.
   */
  lastOperationTypeName?: string | undefined
}
