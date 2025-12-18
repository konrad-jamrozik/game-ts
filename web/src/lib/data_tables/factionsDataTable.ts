/**
 * Faction data tables
 *
 * This file contains tables related to factions.
 *
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
