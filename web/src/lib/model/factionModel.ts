export type FactionId = 'faction-red-dawn' | 'faction-black-lotus' | 'faction-exalt' | 'faction-followers-of-dagon'

export type FactionDataId = `factiondata-${string}`

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

export function asActivityLevelOrd(value: number): FactionActivityLevelOrd {
  assertIsActivityLevelOrd(value)
  return value
}

export function assertIsActivityLevelOrd(value: number): asserts value is FactionActivityLevelOrd {
  if (value < 0 || value > 7 || !Number.isInteger(value)) {
    throw new Error(`Invalid activity level: ${value}. Must be an integer 0-7.`)
  }
}

export function asOperationLevelOrd(value: number): FactionOperationLevelOrd {
  assertIsOperationLevelOrd(value)
  return value
}

export function assertIsOperationLevelOrd(value: number): asserts value is FactionOperationLevelOrd {
  if (value < 1 || value > 6 || !Number.isInteger(value)) {
    throw new Error(`Invalid operation level: ${value}. Must be an integer 1-6.`)
  }
}

export function assertIsFactionId(id: string): asserts id is FactionId {
  if (!id.startsWith('faction-')) {
    throw new Error(`Invalid faction ID: ${id}`)
  }
}
