/**
 * Faction activity level data table
 *
 * This table defines all faction activity levels and their configurations.
 * Combines activity level progression data and operation roll probability data.
 *
 * Legend:
 * - Ord: Activity level ordinal (0-7).
 * - Name: Name of the activity level.
 * - TurnsMin: Minimum number of turns required for progression to next level.
 * - TurnsMax: Maximum number of turns required for progression (randomized between min and max).
 * - FrequencyMin: Minimum frequency of operation rolls in turns (empty string '' if not applicable).
 * - FrequencyMax: Maximum frequency of operation rolls in turns (empty string '' if not applicable).
 * - Level1ProbPct through Level6ProbPct: Probability percentage for each operation level:
 *   - Level 1: soft operations
 *   - Level 2: violent but small-scale
 *   - Level 3: strategic threats
 *   - Level 4: regional destabilization
 *   - Level 5: global conflict
 *   - Level 6: existential
 * - Values are percentages (e.g., 80 = 80%), empty string '' means not applicable for that activity level.
 *
 * Notes:
 * - Activity level steadily increases over time according to progression tables.
 * - When a player wins any kind of mission against the faction (defensive or offensive),
 *   this suppresses the faction for some turns depending on the mission reward.
 * - Nothing else influences activity level progression.
 * - Progression display shows "number_of_turns/minimal_possible_threshold" (e.g., 13/60).
 *   The increase may be the minimum threshold up to +50% turns (e.g., 60-90 turns).
 * - No given operation type from a given operation level can be randomized twice in a row,
 *   unless the operation level has only one operation type. Then it can be randomized
 *   any amount of times in a row.
 */

import type { FactionActivityLevelName, FactionActivityLevelOrd } from '../model/factionModel'

// prettier-ignore
export function bldActivityLevelsTable(): readonly FactionActivityLevelData[] {
  return toFactionActivityLevelData([
  // Ord, Name,        TurnsMin, TurnsMax, FreqMin, FreqMax, L1%,  L2%,  L3%,  L4%,  L5%,  L6%
  [0,    'Dormant',    15,       30,       '',      '',      '',   '',   '',   '',   '',   ''],
  [1,    'Faint',      60,       90,       15,      25,      80,   20,   '',   '',   '',   ''],
  [2,    'Emerging',   60,       90,       13,      23,      60,   30,   10,   '',   '',   ''],
  [3,    'Active',     60,       90,       11,      21,      40,   40,   15,    5,   '',   ''],
  [4,    'Expanding',  60,       90,       10,      20,      30,   30,   30,   10,   '',   ''],
  [5,    'Escalating', 60,       90,        9,      19,      20,   25,   35,   15,    5,   ''],
  [6,    'War',        60,       90,        8,      18,      15,   20,   30,   20,   10,    5],
  [7,    'Total war',  Infinity, Infinity,  7,      17,      10,   15,   25,   25,   15,   10],
  ])
}

export type FactionActivityLevelData = {
  ord: FactionActivityLevelOrd
  name: FactionActivityLevelName
  turnsMin: number
  turnsMax: number
  frequencyMin: number
  frequencyMax: number
  level1ProbPct: number
  level2ProbPct: number
  level3ProbPct: number
  level4ProbPct: number
  level5ProbPct: number
  level6ProbPct: number
  operationFrequencyMin: number
  operationFrequencyMax: number
  operationLevelWeights: [number, number, number, number, number, number]
}

type FactionActivityLevelDataRow = [
  ord: FactionActivityLevelOrd,
  name: FactionActivityLevelName,
  turnsMin: number,
  turnsMax: number,
  frequencyMin: number | '',
  frequencyMax: number | '',
  level1ProbPct: number | '',
  level2ProbPct: number | '',
  level3ProbPct: number | '',
  level4ProbPct: number | '',
  level5ProbPct: number | '',
  level6ProbPct: number | '',
]

function toFactionActivityLevelData(rows: FactionActivityLevelDataRow[]): FactionActivityLevelData[] {
  return rows.map((row) => {
    const frequencyMin = getFrequency(row[4])
    const frequencyMax = getFrequency(row[5])
    const level1ProbPct = getOperationLevelWeight(row[6])
    const level2ProbPct = getOperationLevelWeight(row[7])
    const level3ProbPct = getOperationLevelWeight(row[8])
    const level4ProbPct = getOperationLevelWeight(row[9])
    const level5ProbPct = getOperationLevelWeight(row[10])
    const level6ProbPct = getOperationLevelWeight(row[11])

    return {
      ord: row[0],
      name: row[1],
      turnsMin: row[2],
      turnsMax: row[3],
      frequencyMin,
      frequencyMax,
      level1ProbPct,
      level2ProbPct,
      level3ProbPct,
      level4ProbPct,
      level5ProbPct,
      level6ProbPct,
      operationFrequencyMin: frequencyMin,
      operationFrequencyMax: frequencyMax,
      operationLevelWeights: [level1ProbPct, level2ProbPct, level3ProbPct, level4ProbPct, level5ProbPct, level6ProbPct],
    }
  })
}

function getFrequency(freq: number | ''): number {
  if (freq === '') {
    return Infinity
  }
  return freq
}

function getOperationLevelWeight(weight: number | ''): number {
  if (weight === '') {
    return 0
  }
  return weight
}
