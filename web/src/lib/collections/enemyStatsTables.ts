import { toF6, type Fixed6 } from '../primitives/fixed6'
import type { EnemyType } from '../model/missionSiteModel'

/**
 * Enemy unit statistics
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

export const ENEMY_STATS = bldEnemyStats()

export type EnemyStats = {
  name: EnemyType
  aliases: string
  skill: Fixed6
  hp: number
  damage: number
  isOfficer: boolean
}

// prettier-ignore
export const ENEMY_STATS_DATA: EnemyStats[] = toEnemyStats(
  [
    // Name,            Aliases, Skill,  HP, Weapon, IsOfficer
    ['Initiate',      'In Init',    40,  20,      8, false ],
    ['Operative',     'Op Oper',    60,  25,     10, false ],
    ['Handler',       'Hn Hndl',    80,  25,     10, true  ],
    ['Soldier',       'Sl Sldr',   120,  30,     14, false ],
    ['Lieutenant',    'Lt Ltnt',   140,  30,     16, true  ],
    ['Elite',         'El Elit',   250,  40,     20, false ],
    ['Commander',     'Cm Cmdr',   300,  40,     22, true  ],
    ['HighCommander', 'HC HCmd',   500,  50,     28, true  ],
    ['CultLeader',    'CL CLdr',   800,  80,     32, true  ],
  ])

type EnemyStatsRow = [name: EnemyType, aliases: string, skill: number, hp: number, damage: number, isOfficer: boolean]

function toEnemyStats(rows: EnemyStatsRow[]): EnemyStats[] {
  return rows.map((row) => ({
    name: row[0],
    aliases: row[1],
    skill: toF6(row[2]),
    hp: row[3],
    damage: row[4],
    isOfficer: row[5],
  }))
}

function bldEnemyStats(): Record<string, { skill: Fixed6; hp: number; damage: number; isOfficer: boolean }> {
  const stats: Record<string, { skill: Fixed6; hp: number; damage: number; isOfficer: boolean }> = {}

  for (const enemyStat of ENEMY_STATS_DATA) {
    stats[enemyStat.name] = {
      skill: enemyStat.skill,
      hp: enemyStat.hp,
      damage: enemyStat.damage,
      isOfficer: enemyStat.isOfficer,
    }
  }

  return stats
}
