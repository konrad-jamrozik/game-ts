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

import type { ActivityLevel } from '../model/factionModel'
import type { FactionId } from '../model/missionSiteModel'

/**
 * Faction definitions.
 *
 * Legend:
 * - Id: Faction ID (e.g., 'faction-red-dawn').
 * - Name: Faction name (e.g., 'Red Dawn').
 * - InitialActivityLevel: Initial activity level when game starts (0 = Dormant, 1 = Faint, etc.).
 */
// prettier-ignore
export const FACTION_DATA: FactionStats[] = toFactionStats([
  // Id,                    Name,        InitialActivityLevel
  ['faction-red-dawn',      'Red Dawn',    1],
  ['faction-exalt',         'Exalt',       0],
  ['faction-black-lotus',   'Black Lotus', 0],
])

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
  //TurnsMin, TurnsMax,
  [      15,       30],
  [      60,       90],
  [      60,       90],
  [      60,       90],
  [      60,       90],
  [      60,       90],
  [      60,       90],
  [Infinity, Infinity],
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
  // Level, Name,        FreqMin, FreqMax, L1%,  L2%,  L3%,  L4%,  L5%,  L6%
  [0,       'Dormant',   '',       '',      '',   '',   '',   '',   '',   ''],
  [1,       'Faint',     15,       25,      80,   20,   '',   '',   '',   ''],
  [2,       'Emerging',  13,       23,      60,   30,   10,   '',   '',   ''],
  [3,       'Active',    11,       21,      40,   40,   15,    5,   '',   ''],
  [4,       'Expanding', 10,       20,      30,   30,   30,   10,   '',   ''],
  [5,       'Escalating', 9,       19,      20,   25,   35,   15,    5,   ''],
  [6,       'War',        8,       18,      15,   20,   30,   20,   10,    5],
  [7,       'Total war',  7,       17,      10,   15,   25,   25,   15,   10],
])

export type FactionStats = {
  id: FactionId
  name: string
  initialActivityLevel: ActivityLevel
}

export type ActivityLevelProgressionStats = {
  turnsMin: number
  turnsMax: number
}

export type FactionOperationRollProbabilityStats = {
  activityLevel: number
  activityLevelName: string
  frequencyMin: number | ''
  frequencyMax: number | ''
  level1ProbPct: number | ''
  level2ProbPct: number | ''
  level3ProbPct: number | ''
  level4ProbPct: number | ''
  level5ProbPct: number | ''
  level6ProbPct: number | ''
}

type FactionStatsRow = [id: FactionId, name: string, initialActivityLevel: ActivityLevel]

type ActivityLevelProgressionRow = [turnsMin: number, turnsMax: number]

type FactionOperationRollProbabilityRow = [
  activityLevel: number,
  activityLevelName: string,
  frequencyMin: number | '',
  frequencyMax: number | '',
  level1ProbPct: number | '',
  level2ProbPct: number | '',
  level3ProbPct: number | '',
  level4ProbPct: number | '',
  level5ProbPct: number | '',
  level6ProbPct: number | '',
]

function toFactionStats(rows: FactionStatsRow[]): FactionStats[] {
  return rows.map((row) => ({
    id: row[0],
    name: row[1],
    initialActivityLevel: row[2],
  }))
}

function toActivityLevelProgressionStats(rows: ActivityLevelProgressionRow[]): ActivityLevelProgressionStats[] {
  return rows.map((row) => ({
    turnsMin: row[0],
    turnsMax: row[1],
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
    level1ProbPct: row[4],
    level2ProbPct: row[5],
    level3ProbPct: row[6],
    level4ProbPct: row[7],
    level5ProbPct: row[8],
    level6ProbPct: row[9],
  }))
}
