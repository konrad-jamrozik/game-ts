import { ENEMY_STATS } from '../collections/enemyStatsTables'
import { ENEMY_TYPES, type Enemy, type EnemyType } from '../model/missionModel'
import type { EnemyCounts } from '../collections/missionStatsTables'
import { toF6 } from '../primitives/fixed6'
import { bldWeapon } from './weaponRuleset'

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
  const stats = ENEMY_STATS[type]
  if (!stats) {
    throw new Error(`Unknown enemy type: ${type}`)
  }

  const id = `enemy-${type}-${currentIdCounter}`

  return {
    id,
    type,
    skill: stats.skill,
    exhaustionPct: 0, // Enemies start with 0 exhaustion
    hitPoints: toF6(stats.hp),
    maxHitPoints: stats.hp,
    weapon: bldWeapon(stats.damage),
    isOfficer: stats.isOfficer,
  }
}
