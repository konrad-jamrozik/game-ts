import { toF6, type Fixed6 } from '../primitives/fixed6'

type EnemyStatsRow = [name: string, aliases: string, skill: number, hp: number, damage: number, isOfficer: boolean]

// prettier-ignore
const ENEMY_STATS_DATA: EnemyStatsRow[] = [
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
]

function buildEnemyStats(): Record<string, { skill: Fixed6; hp: number; damage: number; isOfficer: boolean }> {
  const stats: Record<string, { skill: Fixed6; hp: number; damage: number; isOfficer: boolean }> = {}

  for (const [name, , skill, hp, damage, isOfficer] of ENEMY_STATS_DATA) {
    stats[name] = {
      skill: toF6(skill),
      hp,
      damage,
      isOfficer,
    }
  }

  return stats
}

export const ENEMY_STATS = buildEnemyStats()
