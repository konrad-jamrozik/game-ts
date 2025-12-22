import type { Fixed6 } from '../primitives/fixed6'
import type { MissionState } from './outcomeTypes'
import type { AgentId } from './agentModel'
import type { FactionId } from './factionModel'

export type { MissionState } from './outcomeTypes'

export type MissionId = `mission-${string}`

export type MissionDataId = `missiondata-${string}`

export type Actor = {
  id: EnemyId | AgentId
  skill: Fixed6
  hitPoints: Fixed6
  // KJA3 maxHitPoints should be Fixed6
  maxHitPoints: number
  // KJA3 exhaustionPct should be Fixed6
  exhaustionPct: number
  weapon: Weapon
}

export type Weapon = {
  damage: number
  minDamage: number
  maxDamage: number
}

export const ENEMY_TYPES = [
  'initiate',
  'operative',
  'handler',
  'soldier',
  'lieutenant',
  'elite',
  'commander',
  'highCommander',
  'cultLeader',
] as const

export type EnemyType = (typeof ENEMY_TYPES)[number]

export type Enemy = Actor & {
  type: EnemyType
  isOfficer: boolean
}

export type EnemyId = `enemy-${string}`

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

export type Mission = {
  id: MissionId
  missionDataId: MissionDataId
  agentIds: AgentId[]
  state: MissionState
  expiresIn: number | 'never'
  enemies: Enemy[] // Enemies present at the mission
  /**
   * The operation level that spawned this mission.
   * - undefined = Offensive missions (apprehend/raid) - no penalties on expiration
   * - 1-6 = Defensive missions (faction operations) - penalties apply on expiration
   * Used to calculate penalties when mission expires.
   */
  operationLevel?: number | undefined
}

export { type FactionId } from './factionModel'

export function assertIsMissionId(id: string): asserts id is MissionId {
  if (!id.startsWith('mission-')) {
    throw new Error(`Invalid mission ID: ${id}`)
  }
}

export function assertIsMissionDataId(id: string): asserts id is MissionDataId {
  if (!id.startsWith('missiondata-')) {
    throw new Error(`Invalid mission data ID: ${id}`)
  }
}

// Legacy function for backward compatibility during migration
export function assertIsMissionDefId(id: string): asserts id is MissionDataId {
  assertIsMissionDataId(id)
}
