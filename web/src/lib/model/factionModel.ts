import type { FactionId } from './missionModel'

/**
 * Activity level progression values.
 * 0 = Dormant, 1 = Faint, 2 = Emerging, 3 = Active, 4 = Expanding, 5 = Escalating, 6 = War, 7 = Total War
 */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export const ACTIVITY_LEVEL_NAMES = [
  'Dormant',
  'Faint',
  'Emerging',
  'Active',
  'Expanding',
  'Escalating',
  'War',
  'Total War',
] as const

export type ActivityLevelName = (typeof ACTIVITY_LEVEL_NAMES)[number]

export type Faction = {
  id: FactionId
  name: string
  /**
   * Current activity level (0-7).
   * Determines faction operation frequency and strength.
   */
  activityLevel: ActivityLevel
  /**
   * Number of turns at current activity level.
   * When this reaches the threshold for current level, activity level increases.
   */
  turnsAtCurrentLevel: number
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
  discoveryPrerequisite: string[]
}
