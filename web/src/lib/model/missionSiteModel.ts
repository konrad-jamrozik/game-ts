import type { Fixed6 } from '../primitives/fixed6'
import type { MissionSiteState } from './outcomeTypes'

export type { MissionSiteState } from './outcomeTypes'

export type MissionSiteId = `mission-site-${string}`

export type FactionId = 'faction-red-dawn' | 'faction-black-lotus' | 'faction-exalt' | 'faction-followers-of-dagon'

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

export type MissionSiteMother = {
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
