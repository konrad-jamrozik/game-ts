import { toF6, type Fixed6 } from '../primitives/fixed6'
import type { EnemyType } from '../model/missionModel'

/**
 * Enemy units data table
 *
 * This table defines the core statistics for all enemy unit types in the game.
 * Each enemy type has skill, hit points, weapon damage, and officer status.
 *
 * Legend:
 * - Name: Full name of the enemy unit type.
 * - Aliases: Short aliases used in mission specifications (format: "Short Full").
 * - Skill: Combat skill value for the enemy unit.
 * - HP: Hit points (health) for the enemy unit.
 * - Weapon: Base weapon damage value.
 * - IsOfficer: Whether this unit type is an officer (affects mission composition).
 */

// prettier-ignore
export const ENEMIES_DATA_TABLE: EnemyData[] = toEnemiesDataTable(
  [
    // Name,            Aliases, Skill,  HP, Weapon, IsOfficer
    ['initiate',      'In Init',    40,  20,      8, false ],
    ['operative',     'Op Oper',    60,  25,     10, false ],
    ['handler',       'Hn Hndl',    80,  25,     10, true  ],
    ['soldier',       'Sl Sldr',   120,  30,     14, false ],
    ['lieutenant',    'Lt Ltnt',   140,  30,     16, true  ],
    ['elite',         'El Elit',   250,  40,     20, false ],
    ['commander',     'Cm Cmdr',   300,  40,     22, true  ],
    ['highCommander', 'HC HCmd',   500,  50,     28, true  ],
    ['cultLeader',    'CL CLdr',   800,  80,     32, true  ],
  ])

export const ENEMY_STATS = bldEnemyStats()

export type EnemyData = {
  name: EnemyType
  aliases: string
  skill: Fixed6
  hp: number
  damage: number
  isOfficer: boolean
}

export type EnemyCounts = {
  initiate: number
  operative: number
  soldier: number
  elite: number
  handler: number
  lieutenant: number
  commander: number
  highCommander: number
  cultLeader: number
}

type EnemyDataRow = [name: EnemyType, aliases: string, skill: number, hp: number, damage: number, isOfficer: boolean]

function toEnemiesDataTable(rows: EnemyDataRow[]): EnemyData[] {
  return rows.map((row) => ({
    name: row[0],
    aliases: row[1],
    skill: toF6(row[2]),
    hp: row[3],
    damage: row[4],
    isOfficer: row[5],
  }))
}

function bldEnemyStats(): Record<string, EnemyData> {
  const stats: Record<string, EnemyData> = {}

  for (const enemyStat of ENEMIES_DATA_TABLE) {
    stats[enemyStat.name] = enemyStat
  }

  return stats
}
