import { ENEMY_TYPES, type Enemy, type EnemyCounts, type EnemyType } from '../model/enemyModel'
import { getEnemyByType } from '../data_tables/dataTables'
import { toF6 } from '../primitives/fixed6'
import { bldWeapon } from './weaponFactory'
import { assertAboveZero, assertNonNeg, assertTrue } from '../primitives/assertPrimitives'
import { formatEnemyId } from '../data_table_utils/formatModelUtils'

let idCounter = 0

/**
 * Creates multiple enemies from an enemy list object
 * Example: { initiate: 2, operative: 1 } creates 2 Initiates and 1 Operative
 */
export function bldEnemies(enemyCounts: Partial<EnemyCounts>): Enemy[] {
  assertAboveZero(Object.keys(enemyCounts).length, 'At least one enemy type must be specified')
  const hasPositiveCount = Object.values(enemyCounts).some((count) => count > 0)
  assertTrue(hasPositiveCount, 'At least one enemy count must be above zero')

  // Reset enemy ID counter for each mission
  idCounter = 1

  const enemies: Enemy[] = []

  for (const enemyType of ENEMY_TYPES) {
    const count = enemyCounts[enemyType]
    if (count !== undefined) {
      assertNonNeg(count, `Enemy count must be non-negative. Enemy type: ${enemyType}, count: ${count}`)
      for (let index = 0; index < count; index += 1) {
        enemies.push(bldEnemy(enemyType, idCounter))
        idCounter += 1
      }
    }
  }

  return enemies
}

/**
 * Creates an enemy of the specified type
 */
export function bldEnemy(type: EnemyType, currentIdCounter: number): Enemy {
  const enemyData = getEnemyByType(type)

  const id = formatEnemyId(type, currentIdCounter)

  return {
    id,
    type,
    skill: enemyData.skill,
    exhaustionPct: 0,
    hitPoints: toF6(enemyData.hp),
    maxHitPoints: enemyData.hp,
    weapon: bldWeapon({ damage: enemyData.damage }),
    isOfficer: enemyData.isOfficer,
  }
}
