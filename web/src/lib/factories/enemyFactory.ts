import type { EnemyCounts } from '../data_tables/enemiesDataTable'
import { getEnemyByType } from '../data_tables/dataTables'
import { ENEMY_TYPES, type Enemy, type EnemyType } from '../model/missionModel'
import { toF6 } from '../primitives/fixed6'
import { bldWeapon } from './weaponFactory'

let idCounter = 0

/**
 * Creates multiple enemies from an enemy list object
 * Example: { initiate: 2, operative: 1 } creates 2 Initiates and 1 Operative
 */
export function bldEnemies(enemyCounts: Partial<EnemyCounts>): Enemy[] {
  // Reset enemy ID counter for each mission
  idCounter = 1

  const units: Enemy[] = []

  for (const type of ENEMY_TYPES) {
    const count = enemyCounts[type]
    if (count !== undefined && count > 0) {
      for (let index = 0; index < count; index += 1) {
        units.push(bldEnemy(type, idCounter))
        idCounter += 1
      }
    }
  }

  return units
}

/**
 * Creates an enemy of the specified type
 */
export function bldEnemy(type: EnemyType, currentIdCounter: number): Enemy {
  const enemyData = getEnemyByType(type)

  const id = `enemy-${type}-${currentIdCounter}`

  return {
    id,
    type,
    skill: enemyData.skill,
    exhaustionPct: 0, // Enemies start with 0 exhaustion
    hitPoints: toF6(enemyData.hp),
    maxHitPoints: enemyData.hp,
    weapon: bldWeapon({ damage: enemyData.damage }),
    isOfficer: enemyData.isOfficer,
  }
}
