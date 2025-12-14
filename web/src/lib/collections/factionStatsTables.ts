/**
 * Faction statistics tables
 *
 * This file contains tables related to factions, including their activity levels and activity level progression.
 *
 * Activity levels:
 * - 0: Dormant / Defeated
 * - 0.X: Faint
 * - 1.X: Emerging
 * - 2.X: Active
 * - 3.X: Expanding
 * - 4.X: Escalating
 * - 5.X: War
 * - 6: Total war
 *
 * Notes:
 * - Activity level steadily increases over time according to progression tables.
 * - When a player wins any kind of mission against the faction (defensive or offensive),
 *   this suppresses the faction for some turns depending on the mission reward.
 * - Nothing else influences activity level progression.
 * - Progression display shows "number_of_turns/minimal_possible_threshold" (e.g., 13/60).
 *   The increase may be the minimum threshold up to +50% turns (e.g., 60-90 turns).
 */

/**
 * Typical activity level progression for factions.
 *
 * Legend:
 * - Faction: Faction name (currently only Red Dawn data available).
 * - FromLevel: Starting activity level name.
 * - ToLevel: Target activity level name.
 * - TurnsMin: Minimum number of turns required for progression.
 * - TurnsMax: Maximum number of turns required for progression.
 * - CumulativeMin: Minimum cumulative turns from start.
 * - CumulativeMax: Maximum cumulative turns from start.
 */
// prettier-ignore
export const FACTION_ACTIVITY_LEVEL_PROGRESSION_DATA: ActivityLevelProgressionStats[] = toActivityLevelProgressionStats([
  // Faction,   FromLevel,    ToLevel,      TurnsMin, TurnsMax, CumulativeMin, CumulativeMax
  ['Red Dawn',  'Dormant',    'Faint',            15,      30,              0,            0],
  ['Red Dawn',  'Faint',      'Emerging',         60,      90,             60,           90],
  ['Red Dawn',  'Emerging',   'Active',           60,      90,            120,          180],
  ['Red Dawn',  'Active',     'Expanding',        60,      90,            180,          270],
  ['Red Dawn',  'Expanding',  'Escalating',       60,      90,            240,          360],
  ['Red Dawn',  'Escalating', 'War',              60,      90,            300,          450],
  ['Red Dawn',  'War',        'Total war',        60,      90,            360,          540],
])

/**
 * Faction operation roll probabilities by activity level.
 *
 * Maps activity level to probabilities of faction operations at different levels.
 * The faction operation roll happens more frequently the higher the faction's activity level.
 *
 * Legend:
 * - ActivityLevel: Numeric activity level (0-7).
 * - ActivityLevelName: Name of the activity level.
 * - FrequencyMin: Minimum frequency of operation rolls in turns (empty string '' if not applicable).
 * - FrequencyMax: Maximum frequency of operation rolls in turns (empty string '' if not applicable).
 * - FrequencyTypical: Typical/average frequency of operation rolls in turns (empty string '' if not applicable).
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
 * - No given operation type from a given operation level can be randomized twice in a row,
 *   unless the operation level has only one operation type. Then it can be randomized
 *   any amount of times in a row.
 */
// prettier-ignore
export const FACTION_OPERATION_ROLL_PROBABILITY_DATA: FactionOperationRollProbabilityStats[] = toFactionOperationRollProbabilityStats([
  // Level, Name,        FreqMin, FreqMax, FreqTyp, L1%,  L2%,  L3%,  L4%,  L5%,  L6%
  [0,       'Dormant',   '',       '',      '',      '',   '',   '',   '',   '',   ''],
  [1,       'Faint',     15,       25,      20,      80,   20,   '',   '',   '',   ''],
  [2,       'Emerging',  13,       23,      18,      60,   30,   10,   '',   '',   ''],
  [3,       'Active',    11,       21,      16,      40,   40,   15,    5,   '',   ''],
  [4,       'Expanding', 10,       20,      15,      30,   30,   30,   10,   '',   ''],
  [5,       'Escalating', 9,       19,      14,      20,   25,   35,   15,    5,   ''],
  [6,       'War',        8,       18,      13,      15,   20,   30,   20,   10,    5],
  [7,       'Total war',  7,       17,      12,      10,   15,   25,   25,   15,   10],
])

export type ActivityLevelProgressionStats = {
  faction: string
  fromLevel: string
  toLevel: string
  turnsMin: number
  turnsMax: number
  cumulativeMin: number
  cumulativeMax: number
}

export type FactionOperationRollProbabilityStats = {
  activityLevel: number
  activityLevelName: string
  frequencyMin: number | ''
  frequencyMax: number | ''
  frequencyTypical: number | ''
  level1ProbPct: number | ''
  level2ProbPct: number | ''
  level3ProbPct: number | ''
  level4ProbPct: number | ''
  level5ProbPct: number | ''
  level6ProbPct: number | ''
}

type ActivityLevelProgressionRow = [
  faction: string,
  fromLevel: string,
  toLevel: string,
  turnsMin: number,
  turnsMax: number,
  cumulativeMin: number,
  cumulativeMax: number,
]

type FactionOperationRollProbabilityRow = [
  activityLevel: number,
  activityLevelName: string,
  frequencyMin: number | '',
  frequencyMax: number | '',
  frequencyTypical: number | '',
  level1ProbPct: number | '',
  level2ProbPct: number | '',
  level3ProbPct: number | '',
  level4ProbPct: number | '',
  level5ProbPct: number | '',
  level6ProbPct: number | '',
]

function toActivityLevelProgressionStats(rows: ActivityLevelProgressionRow[]): ActivityLevelProgressionStats[] {
  return rows.map((row) => ({
    faction: row[0],
    fromLevel: row[1],
    toLevel: row[2],
    turnsMin: row[3],
    turnsMax: row[4],
    cumulativeMin: row[5],
    cumulativeMax: row[6],
  }))
}

function toFactionOperationRollProbabilityStats(
  rows: FactionOperationRollProbabilityRow[],
): FactionOperationRollProbabilityStats[] {
  return rows.map((row) => ({
    activityLevel: row[0],
    activityLevelName: row[1],
    frequencyMin: row[2],
    frequencyMax: row[3],
    frequencyTypical: row[4],
    level1ProbPct: row[5],
    level2ProbPct: row[6],
    level3ProbPct: row[7],
    level4ProbPct: row[8],
    level5ProbPct: row[9],
    level6ProbPct: row[10],
  }))
}
