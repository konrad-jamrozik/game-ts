/**
 * Faction data tables
 *
 * This file contains tables related to factions.
 *
 */

import type { FactionActivityLevelOrd } from '../model/factionModel'
import type { FactionDataId, FactionId } from '../model/modelIds'

/**
 * Faction definitions.
 *
 * Legend:
 * - Id: Faction ID (e.g., 'faction-red-dawn').
 * - Name: Faction name (e.g., 'Red Dawn').
 * - InitialActivityLevel: Initial activity level when game starts (0 = Dormant, 1 = Faint, etc.).
 */
// prettier-ignore
export function bldFactionsTable(): readonly FactionData[] {
  return toFactionsDataTable([
  // Id,                    Name,        InitialActivityLevel
  ['faction-red-dawn',      'Red Dawn',    1],
  ['faction-exalt',         'Exalt',       0],
  ['faction-black-lotus',   'Black Lotus', 0],
  ])
}

export type FactionData = {
  id: FactionId
  factionDataId: FactionDataId
  name: string
  initialActivityLevel: FactionActivityLevelOrd
  discoveryPrerequisite: string[]
}

type FactionDataRow = [id: FactionId, name: string, initialActivityLevel: FactionActivityLevelOrd]

function toFactionsDataTable(rows: FactionDataRow[]): FactionData[] {
  return rows.map((row) => {
    const id = row[0]
    const name = row[1]
    const initialActivityLevel = row[2]
    // KJA3 should this one of the ID fmt functions?
    const factionDataId: FactionDataId = `factiondata-${id.replace('faction-', '')}`
    const discoveryPrerequisite = [`lead-${id.replace('faction-', '')}-profile`]
    return {
      id,
      factionDataId,
      name,
      initialActivityLevel,
      discoveryPrerequisite,
    }
  })
}
