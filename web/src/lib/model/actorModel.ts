import type { Fixed6 } from '../primitives/fixed6'
import type { AgentId } from './agentModel'

export type Weapon = {
  damage: number
  minDamage: number
  maxDamage: number
}

export type EnemyId = `enemy-${string}`

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
