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
  maxHitPoints: Fixed6
  exhaustionPct: Fixed6
  weapon: Weapon
}
