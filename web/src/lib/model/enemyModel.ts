import type { Actor } from './actorModel'

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

export type EnemyCounts = Record<EnemyType, number>
