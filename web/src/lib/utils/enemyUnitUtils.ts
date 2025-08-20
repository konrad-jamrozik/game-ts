import { ENEMY_UNIT_STATS } from '../model/ruleset/constants'
import type { EnemyUnit, EnemyUnitType } from '../model/model'
import { createWeapon } from './weaponUtils'

let idCounter = 0

/**
 * Creates multiple enemy units from a specification string
 * Example: "2 Initiate, 1 Operative" creates 2 Initiates and 1 Operative
 */
export function createEnemyUnitsFromSpec(spec: string): EnemyUnit[] {
  // Reset enemy unit ID counter for each mission site
  idCounter = 1

  const units: EnemyUnit[] = []
  const parts = spec.split(',').map((p) => p.trim())

  for (const part of parts) {
    const match = part.match(/^(\d+)\s+(.+)$/)
    if (match && match[1] && match[2]) {
      const count = parseInt(match[1], 10)
      const type = match[2] as EnemyUnitType

      for (let i = 0; i < count; i++) {
        units.push(createEnemyUnit(type, idCounter))
        idCounter += 1
      }
    }
  }

  return units
}

/**
 * Creates an enemy unit of the specified type
 */
function createEnemyUnit(type: EnemyUnitType, idCounter: number): EnemyUnit {
  const stats = ENEMY_UNIT_STATS[type]
  if (!stats) {
    throw new Error(`Unknown enemy unit type: ${type}`)
  }

  const id = `enemy-${type.toLowerCase()}-${idCounter}`

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
