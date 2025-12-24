/**
 * Faction operation levels data table
 *
 * This file contains tables related to faction operation levels.
 *
 * Legend for Operation Levels:
 * - Level: Operation level (1-6).
 * - Description: Operation level description.
 * - Panic increase (Panic %): Panic increase if the player fails to complete the defensive mission.
 * - Money: Money reward if the player completes the defensive mission.
 * - Funding reward (Fund+): Funding reward if the player completes the defensive mission.
 * - Funding penalty (Fund-): Funding penalty if the player fails to complete the defensive mission
 *   (negative = funding loss).
 *
 * Notes:
 * - All player offensive missions have undefined operation level (no operation level).
 * - Level 6 existential has no penalties or rewards except: if the player fails to complete
 *   the mission, it is game over.
 * - When a faction operation succeeds (defensive mission expires or fails), rewards and penalties
 *   are applied based on the operation level.
 */
import type { FactionOperationLevelOrd } from '../model/factionModel'
import { asOperationLevelOrd } from '../model_utils/factionModelUtils'

// prettier-ignore
export function bldFactionOperationLevelsTable(): readonly FactionOperationLevelData[] {
  return toFactionOperationLevelsDataTable([
  // Level, Description,               Panic %, Money, Fund+, Fund-
  [1,       'Soft operations'          , 0.02 ,    10,     0,     0],
  [2,       'Violent but small-scale'  , 0.1  ,    30,     5,     1],
  [3,       'Strategic threats'        , 0.3  ,   100,    20,     4],
  [4,       'Regional destabilization' , 1    ,   300,    40,     8],
  [5,       'Global conflict'          , 3    ,  1000,    80,    16],
  [6,       'Existential'              , 0    ,     0,     0,     0],
  ])
}

export type FactionOperationLevelData = {
  ord: FactionOperationLevelOrd
  description: string
  panicIncreasePct: number
  moneyReward: number
  fundingReward: number
  fundingPenalty: number
}

type FactionOperationLevelDataRow = [
  level: number,
  description: string,
  panicIncreasePct: number,
  moneyReward: number,
  fundingReward: number,
  fundingPenalty: number,
]

function toFactionOperationLevelsDataTable(rows: FactionOperationLevelDataRow[]): FactionOperationLevelData[] {
  return rows.map((row) => ({
    ord: asOperationLevelOrd(row[0]),
    description: row[1],
    panicIncreasePct: row[2],
    moneyReward: row[3],
    fundingReward: row[4],
    fundingPenalty: row[5],
  }))
}
