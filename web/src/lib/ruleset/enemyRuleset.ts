import { ENEMY_STATS } from '../collections/enemyStatsTables'
import { ENEMY_TYPES, type Enemy, type EnemyType } from '../model/model'
import { toF6 } from '../primitives/fixed6'
import { newWeapon } from './weaponRuleset'

let idCounter = 0

const VALID_ENEMY_TYPES = new Set<string>(ENEMY_TYPES)

/**
 * Creates multiple enemies from a specification string
 * Example: "2 Initiate, 1 Operative" creates 2 Initiates and 1 Operative
 */
export function newEnemiesFromSpec(spec: string): Enemy[] {
  // Reset enemy ID counter for each mission site
  idCounter = 1

  const units: Enemy[] = []
  const parts = spec.split(',').map((part) => part.trim())

  for (const part of parts) {
    const match = /^(?<count>\d+)\s+(?<type>.+)$/u.exec(part)
    if (
      match?.groups?.['count'] !== undefined &&
      match.groups['count'] !== '' &&
      match.groups['type'] !== undefined &&
      match.groups['type'] !== '' &&
      isValidEnemyType(match.groups['type'])
    ) {
      const count = Number.parseInt(match.groups['count'], 10)
      const { type } = match.groups

      for (let index = 0; index < count; index += 1) {
        units.push(newEnemy(type, idCounter))
        idCounter += 1
      }
    }
  }

  return units
}

function isValidEnemyType(type: string): type is EnemyType {
  return VALID_ENEMY_TYPES.has(type)
}

/**
 * Creates an enemy of the specified type
 */
export function newEnemy(type: EnemyType, currentIdCounter: number): Enemy {
  const stats = ENEMY_STATS[type]
  if (!stats) {
    throw new Error(`Unknown enemy type: ${type}`)
  }

  const id = `enemy-${type.toLowerCase()}-${currentIdCounter}`

  return {
    id,
    type,
    skill: stats.skill,
    exhaustionPct: 0, // Enemies start with 0 exhaustion
    hitPoints: toF6(stats.hp),
    maxHitPoints: stats.hp,
    weapon: newWeapon(stats.damage),
    isOfficer: stats.isOfficer,
  }
}
