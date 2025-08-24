import { ENEMY_STATS } from '../collections/enemyUnits'
import { ENEMY_TYPES, type Enemy, type EnemyType } from '../model/model'
import { createWeapon } from './weaponUtils'

let idCounter = 0

const VALID_ENEMY_TYPES = new Set<string>(ENEMY_TYPES)

function isValidEnemyType(type: string): type is EnemyType {
  return VALID_ENEMY_TYPES.has(type)
}

/**
 * Creates multiple enemies from a specification string
 * Example: "2 Initiate, 1 Operative" creates 2 Initiates and 1 Operative
 */
export function createEnemiesFromSpec(spec: string): Enemy[] {
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
        units.push(createEnemy(type, idCounter))
        idCounter += 1
      }
    }
  }

  return units
}

/**
 * Creates an enemy of the specified type
 */
function createEnemy(type: EnemyType, currentIdCounter: number): Enemy {
  const stats = ENEMY_STATS[type]
  if (!stats) {
    throw new Error(`Unknown enemy type: ${type}`)
  }

  const id = `enemy-${type.toLowerCase()}-${currentIdCounter}`

  return {
    id,
    type,
    skill: stats.skill,
    exhaustion: 0, // Enemies start with 0 exhaustion
    hitPoints: stats.hp,
    maxHitPoints: stats.hp,
    weapon: createWeapon(stats.damage),
    isOfficer: stats.isOfficer,
  }
}
