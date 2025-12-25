import type { Faction, FactionId, FactionActivityLevelOrd, FactionOperationLevelOrd } from '../model/factionModel'
import { assertDefined } from '../primitives/assertPrimitives'

export function getFactionById(gameState: { factions: Faction[] }, factionId: FactionId): Faction {
  const faction = gameState.factions.find((fac) => fac.id === factionId)
  assertDefined(faction, `Faction with id ${factionId} not found`)
  return faction
}

export function asActivityLevelOrd(value: number): FactionActivityLevelOrd {
  assertIsActivityLevelOrd(value)
  return value
}

export function assertIsActivityLevelOrd(value: number): asserts value is FactionActivityLevelOrd {
  if (value < 0 || value > 7 || !Number.isInteger(value)) {
    throw new Error(`Invalid activity level: ${value}. Must be an integer 0-7.`)
  }
}

export function asOperationLevelOrd(value: number): FactionOperationLevelOrd {
  assertIsOperationLevelOrd(value)
  return value
}

export function assertIsOperationLevelOrd(value: number): asserts value is FactionOperationLevelOrd {
  if (value < 1 || value > 6 || !Number.isInteger(value)) {
    throw new Error(`Invalid operation level: ${value}. Must be an integer 1-6.`)
  }
}

export function assertIsFactionId(id: string): asserts id is FactionId {
  if (!id.startsWith('faction-')) {
    throw new Error(`Invalid faction ID: ${id}`)
  }
}
