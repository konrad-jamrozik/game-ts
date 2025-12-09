import { toF6 } from '../primitives/fixed6'
import type { Faction, FactionId } from '../model/model'
import { assertDefined } from '../primitives/assertPrimitives'

export type FactionDefinition = {
  id: FactionId
  name: string
  shortId: string
}

export const factionDefinitions: FactionDefinition[] = [
  { id: 'faction-red-dawn', name: 'Red Dawn', shortId: 'red-dawn' },
  { id: 'faction-exalt', name: 'Exalt', shortId: 'exalt' },
  { id: 'faction-black-lotus', name: 'Black Lotus', shortId: 'black-lotus' },
]

export const factions: Faction[] = factionDefinitions.map((def) => ({
  id: def.id,
  name: def.name,
  threatLevel: toF6(0.01),
  threatIncrease: toF6(0.0005), // 0.05%
  suppression: toF6(0),
  discoveryPrerequisite: [`lead-${def.shortId}-profile`],
}))

export function getFactionById(factionId: string): Faction {
  const foundFaction = factions.find((faction) => faction.id === factionId)
  assertDefined(foundFaction, `Faction with id ${factionId} not found`)
  return foundFaction
}
