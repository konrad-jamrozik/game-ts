import type { Faction } from '../model/factionModel'
import type { FactionId } from '../model/modelIds'
import { assertDefined } from '../primitives/assertPrimitives'

// KJA1 move this and similar to getterUtils
export function getFactionById(gameState: { factions: Faction[] }, factionId: FactionId): Faction {
  const faction = gameState.factions.find((fac) => fac.id === factionId)
  assertDefined(faction, `Faction with id ${factionId} not found`)
  return faction
}
