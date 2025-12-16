import type { Fixed6 } from '../primitives/fixed6'
import type { MissionState } from './outcomeTypes'
import type { EnemyCounts } from '../collections/missionStatsTables'
import type { AgentId } from './agentModel'
import type { FactionId } from './factionModel'

export type { MissionState } from './outcomeTypes'

// KJA3 add type for "agent-" and see if I need any other types like that
export type MissionId = `mission-${string}`

export type MissionDefId = `missiondef-${string}`

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

export type MissionDef = {
  id: MissionDefId
  name: string
  description: string
  expiresIn: number | 'never'
  dependsOn: string[]
  enemyCounts: Partial<EnemyCounts>
  factionId: FactionId
  rewards: MissionRewards
}

export type Mission = {
  id: MissionId
  missionDefId: MissionDefId
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
