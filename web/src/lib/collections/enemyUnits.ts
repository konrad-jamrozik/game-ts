import { toF6, type Fixed6 } from '../primitives/fixed6'

type EnemyStatsRow = [name: string, skill: number, hp: number, damage: number, isOfficer: boolean]

// prettier-ignore
const ENEMY_STATS_DATA: EnemyStatsRow[] = [
  // Name,        Skill,  HP, Damage, IsOfficer
  ['Initiate',       40,  20,      8, false],
  ['Operative',      60,  25,     10, false],
  ['Handler',        80,  25,     10, true ],
  ['Soldier',       120,  30,     14, false],
  ['Lieutenant',    140,  30,     16, true ],
  ['Elite',         250,  40,     20, false],
  ['Commander',     300,  40,     22, true ],
  ['HighCommander', 500,  50,     28, true ],
  ['CultLeader',    800,  80,     32, true ],
]

function buildEnemyStats(): Record<string, { skill: Fixed6; hp: number; damage: number; isOfficer: boolean }> {
  const stats: Record<string, { skill: Fixed6; hp: number; damage: number; isOfficer: boolean }> = {}

  for (const [name, skill, hp, damage, isOfficer] of ENEMY_STATS_DATA) {
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
