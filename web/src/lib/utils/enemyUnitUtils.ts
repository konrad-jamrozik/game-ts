import { ENEMY_UNIT_STATS } from '../model/ruleset/constants'
import type { EnemyUnit, EnemyUnitType } from '../model/model'
import { createWeapon } from './weaponUtils'
import { floor } from './mathUtils'

let idCounter = 0

// KJA dedup with EnemyUnitType in model.ts. See https://stackoverflow.com/questions/78739104/how-can-i-avoid-duplicating-key-in-value-and-duplicating-type-and-const-definit
// I know that for simple string union types I can deduplicate type and const like this:
//   export const NameVal = ['foo', 'bar']
//   export type NameType = (typeof NameVal)[number]

const VALID_ENEMY_UNIT_TYPES = new Set([
  'Initiate',
  'Operative',
  'Handler',
  'Soldier',
  'Lieutenant',
  'Elite',
  'Commander',
  'HighCommander',
])

function isValidEnemyUnitType(type: string): type is EnemyUnitType {
  return VALID_ENEMY_UNIT_TYPES.has(type)
}

/**
 * Creates multiple enemy units from a specification string
 * Example: "2 Initiate, 1 Operative" creates 2 Initiates and 1 Operative
 */
export function createEnemyUnitsFromSpec(spec: string): EnemyUnit[] {
  // Reset enemy unit ID counter for each mission site
  idCounter = 1

  const units: EnemyUnit[] = []
  const parts = spec.split(',').map((part) => part.trim())

  for (const part of parts) {
    const match = /^(?<count>\d+)\s+(?<type>.+)$/u.exec(part)
    if (
      match?.groups?.['count'] !== undefined &&
      match.groups['count'] !== '' &&
      match.groups['type'] !== undefined &&
      match.groups['type'] !== '' &&
      isValidEnemyUnitType(match.groups['type'])
    ) {
      const count = Number.parseInt(match.groups['count'], 10)
      const { type } = match.groups

      for (let index = 0; index < count; index += 1) {
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
function createEnemyUnit(type: EnemyUnitType, currentIdCounter: number): EnemyUnit {
  const stats = ENEMY_UNIT_STATS[type]
  if (!stats) {
    throw new Error(`Unknown enemy unit type: ${type}`)
  }

  const id = `enemy-${type.toLowerCase()}-${currentIdCounter}`

  return {
    id,
    type,
    skill: stats.skill,
    exhaustion: 0, // Enemy units start with 0 exhaustion
    hitPoints: stats.hp,
    maxHitPoints: stats.hp,
    weapon: createWeapon(stats.damage),
    isOfficer: stats.isOfficer,
  }
}

/**
 * Calculates the effective skill of an enemy unit based on hit points lost and exhaustion
 * Uses the same formula as agents - refer to about_agents.md for details
 */
// KJA dedup with agentView.ts effectiveSkill
export function enemyUnitEffectiveSkill(enemy: EnemyUnit): number {
  const hitPointsLost = enemy.maxHitPoints - enemy.hitPoints
  const hitPointsReduction = Math.max(1 - (enemy.maxHitPoints > 0 ? hitPointsLost / enemy.maxHitPoints : 0), 0)
  // First 5 points of exhaustion have no impact
  const exhaustionReduction = Math.max(1 - Math.max(enemy.exhaustion - 5, 0) / 100, 0)

  const result = enemy.skill * hitPointsReduction * exhaustionReduction
  return floor(result)
}
