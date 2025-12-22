import type { Faction, FactionId } from '../model/factionModel'
import { assertDefined } from '../primitives/assertPrimitives'

export function getFactionById(gameState: { factions: Faction[] }, factionId: FactionId): Faction {
  const faction = gameState.factions.find((fac) => fac.id === factionId)
  assertDefined(faction, `Faction with id ${factionId} not found`)
  return faction
}
