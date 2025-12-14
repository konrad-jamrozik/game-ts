import type { Fixed6 } from '../primitives/fixed6'
import type { MissionSiteState, LeadInvestigationState } from './outcomeTypes'

export type { MissionSiteState, LeadInvestigationState } from './outcomeTypes'

export type Actor = {
  id: string
  skill: Fixed6
  hitPoints: Fixed6
  maxHitPoints: number
  exhaustionPct: number
  weapon: Weapon
}

export type Weapon = {
  damage: number
  minDamage: number
  maxDamage: number
}

export type MissionSiteId = `mission-site-${string}`
export type LeadInvestigationId = `investigation-${string}`

export type Lead = {
  id: string
  // KJA lead should have name instead of title
  title: string
  difficulty: number
  description: string
  dependsOn: string[]
  repeatable: boolean
  enemyEstimate?: string // For observability, e.g., "Expect safehouse to have a dozen low-ranked cult members"
}

export type FactionId = 'faction-red-dawn' | 'faction-black-lotus' | 'faction-exalt' | 'faction-followers-of-dagon'

export type FactionRewards = {
  factionId: FactionId
  /**
   * Suppression delays the next faction operation roll by a set number of turns.
   * E.g., suppression: 5 means delay by 5 turns.
   */
  suppression?: number
}

export type MissionRewards = {
  money?: number
  funding?: number
  panicReduction?: Fixed6
  factionRewards?: FactionRewards[]
}

export const ENEMY_TYPES = [
  'Initiate',
  'Operative',
  'Handler',
  'Soldier',
  'Lieutenant',
  'Elite',
  'Commander',
  'HighCommander',
  'CultLeader',
] as const

export type EnemyType = (typeof ENEMY_TYPES)[number]

export type Enemy = Actor & {
  type: EnemyType
  isOfficer: boolean
}

export type MissionSiteTemplate = {
  id: string
  name: string
  description: string
  expiresIn: number | 'never'
  dependsOn: string[]
  enemyUnitsSpec: string
  factionId: FactionId
  rewards: MissionRewards
}

export type MissionSite = {
  id: MissionSiteId
  missionId: string
  agentIds: string[]
  state: MissionSiteState
  expiresIn: number | 'never'
  enemies: Enemy[] // Enemies present at the mission site
  /**
   * The operation level that spawned this mission site.
   * - undefined = Offensive missions (apprehend/raid) - no penalties on expiration
   * - 1-6 = Defensive missions (faction operations) - penalties apply on expiration
   * Used to calculate penalties when mission expires.
   */
  operationLevel?: number | undefined
}

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

export type LeadInvestigation = {
  id: LeadInvestigationId // unique investigation ID
  leadId: string
  accumulatedIntel: number
  agentIds: string[] // agents currently investigating this lead
  startTurn: number // turn when investigation started
  state: LeadInvestigationState
}
