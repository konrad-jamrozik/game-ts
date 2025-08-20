import { ENEMY_UNIT_STATS } from '../model/ruleset/constants'
import type { EnemyUnit, EnemyUnitType } from '../model/model'
import { createWeapon } from './weaponUtils'

let enemyUnitIdCounter = 0

/**
 * Creates an enemy unit of the specified type
 */
export function createEnemyUnit(type: EnemyUnitType): EnemyUnit {
  const stats = ENEMY_UNIT_STATS[type]
  if (!stats) {
    throw new Error(`Unknown enemy unit type: ${type}`)
  }

  const id = `enemy-${type.toLowerCase()}-${enemyUnitIdCounter++}`

  return {
    id,
    type,
    skill: stats.skill,
    hitPoints: stats.hp,
    maxHitPoints: stats.hp,
    weapon: createWeapon(stats.damage),
    isOfficer: stats.isOfficer,
  }
}

/**
 * Creates multiple enemy units from a specification string
 * Example: "2 Initiate, 1 Operative" creates 2 Initiates and 1 Operative
 */
export function createEnemyUnitsFromSpec(spec: string): EnemyUnit[] {
  const units: EnemyUnit[] = []
  const parts = spec.split(',').map((p) => p.trim())

  for (const part of parts) {
    const match = part.match(/^(\d+)\s+(.+)$/)
    if (match && match[1] && match[2]) {
      const count = parseInt(match[1], 10)
      const type = match[2] as EnemyUnitType

      for (let i = 0; i < count; i++) {
        units.push(createEnemyUnit(type))
      }
    }
  }

  return units
}
