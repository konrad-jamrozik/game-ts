import { toF6 } from '../primitives/fixed6'
import type { Faction } from '../model/model'
import { assertDefined } from '../primitives/assertPrimitives'

export const factions: Faction[] = [
  {
    id: 'faction-red-dawn',
    name: 'Red Dawn',
    threatLevel: toF6(0.01),
    threatIncrease: toF6(0.0005), // 0.05%
    suppression: toF6(0),
    discoveryPrerequisite: ['lead-red-dawn-profile'],
  },
]

export function getFactionById(factionId: string): Faction {
  const foundFaction = factions.find((faction) => faction.id === factionId)
  assertDefined(foundFaction, `Faction with id ${factionId} not found`)
  return foundFaction
}
