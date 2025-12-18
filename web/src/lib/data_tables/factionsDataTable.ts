/**
 * Faction data tables
 *
 * This file contains tables related to factions.
 *
 * Note: Activity level data has been moved to factionActivityLevelDefsDataTable.ts
 */

import type { FactionActivityLevelOrd, FactionId } from '../model/factionModel'

/**
 * Faction definitions.
 *
 * Legend:
 * - Id: Faction ID (e.g., 'faction-red-dawn').
 * - Name: Faction name (e.g., 'Red Dawn').
 * - InitialActivityLevel: Initial activity level when game starts (0 = Dormant, 1 = Faint, etc.).
 */
// prettier-ignore
export function bldFactionsTable(): FactionData[] {
  return toFactionsDataTable([
  // Id,                    Name,        InitialActivityLevel
  ['faction-red-dawn',      'Red Dawn',    1],
  ['faction-exalt',         'Exalt',       0],
  ['faction-black-lotus',   'Black Lotus', 0],
  ])
}

export type FactionData = {
  id: FactionId
  name: string
  initialActivityLevel: FactionActivityLevelOrd
}

type FactionDataRow = [id: FactionId, name: string, initialActivityLevel: FactionActivityLevelOrd]

function toFactionsDataTable(rows: FactionDataRow[]): FactionData[] {
  return rows.map((row) => ({
    id: row[0],
    name: row[1],
    initialActivityLevel: row[2],
  }))
}

/**
 * Faction operation level rewards and penalties
 *
 * When a faction operation succeeds (defensive mission expires or fails), rewards and penalties
 * are applied based on the operation level.
 *
 * Notes:
 * - All player offensive missions have undefined operation level (no operation level).
 * - Level 6 existential has no penalties or rewards except: if the player fails to complete
 *   the mission, it is game over.
 *
 * Legend:
 * - Level: Operation level (1-6).
 * - Description: Operation level description.
 * - Panic increase (Panic %): Panic increase if the player fails to complete the defensive mission.
 * - Money: Money reward if the player completes the defensive mission.
 * - Funding reward (Fund+): Funding reward if the player completes the defensive mission.
 * - Funding penalty (Fund-): Funding penalty if the player fails to complete the defensive mission
 *   (negative = funding loss).
 */
// prettier-ignore
export function bldFactionOperationsTable(): FactionOperationData[] {
  return toFactionOperationsDataTable([
  // Level, Description,               Panic %, Money, Fund+, Fund-
  [1,       'Soft operations'          , 0.02 ,    10,     0,     0],
  [2,       'Violent but small-scale'  , 0.1  ,    30,     5,     1],
  [3,       'Strategic threats'        , 0.3  ,   100,    20,     4],
  [4,       'Regional destabilization' , 1    ,   300,    40,     8],
  [5,       'Global conflict'          , 3    ,  1000,    80,    16],
  [6,       'Existential'              , 0    ,     0,     0,     0],
  ])
}

export type FactionOperationData = {
  level: number
  description: string
  panicIncreasePct: number
  moneyReward: number
  fundingReward: number
  fundingPenalty: number
}

type FactionOperationDataRow = [
  level: number,
  description: string,
  panicIncreasePct: number,
  moneyReward: number,
  fundingReward: number,
  fundingPenalty: number,
]

function toFactionOperationsDataTable(rows: FactionOperationDataRow[]): FactionOperationData[] {
  return rows.map((row) => ({
    level: row[0],
    description: row[1],
    panicIncreasePct: row[2],
    moneyReward: row[3],
    fundingReward: row[4],
    fundingPenalty: row[5],
  }))
}
