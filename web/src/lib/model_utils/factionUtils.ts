import { assertDefined } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { Faction } from '../model/factionModel'
import type { FactionDataId, FactionId } from '../model/modelIds'
import type { FactionData } from '../data_tables/factionsDataTable'

export function getFactionShortId(factionId: FactionId): string {
  return fmtNoPrefix(factionId, 'faction-')
}

export function getFactionDataById(id: FactionId): FactionData {
  const found = dataTables.factions.find((faction) => faction.id === id)
  assertDefined(found, `Faction data with id ${id} not found`)
  return found
}

export function getFactionDataByDataId(id: FactionDataId): FactionData {
  const found = dataTables.factions.find((faction) => faction.factionDataId === id)
  assertDefined(found, `Faction data with data id ${id} not found`)
  return found
}

/**
 * Gets the name of a faction from its FactionData.
 */
export function getFactionName(faction: Faction): string {
  const factionData = getFactionDataByDataId(faction.factionDataId)
  return factionData.name
}

export function getFactionById(gameState: { factions: Faction[] }, factionId: FactionId): Faction {
  const faction = gameState.factions.find((fac) => fac.id === factionId)
  assertDefined(faction, `Faction with id ${factionId} not found`)
  return faction
}
