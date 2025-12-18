export type FactionId = 'faction-red-dawn' | 'faction-black-lotus' | 'faction-exalt' | 'faction-followers-of-dagon'

/**
 * Activity level progression values.
 * 0 = Dormant, 1 = Faint, 2 = Emerging, 3 = Active, 4 = Expanding, 5 = Escalating, 6 = War, 7 = Total War
 */
export type FactionActivityLevelOrd = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

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
  name: string
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

export type FactionOperation = {
  level: number
  description: string
  panicIncreasePct: number
  moneyReward: number
  fundingReward: number
  fundingPenalty: number
}

export function assertIsActivityLevelOrd(value: number): asserts value is FactionActivityLevelOrd {
  if (value < 0 || value > 7 || !Number.isInteger(value)) {
    throw new Error(`Invalid activity level: ${value}. Must be an integer 0-7.`)
  }
}

export function asActivityLevelOrd(value: number): FactionActivityLevelOrd {
  assertIsActivityLevelOrd(value)
  return value
}
