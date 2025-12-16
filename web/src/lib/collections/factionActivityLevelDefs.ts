import { assertDefined } from '../primitives/assertPrimitives'
import type { FactionActivityLevelOrd } from '../model/factionModel'
import { FACTION_ACTIVITY_LEVEL_DEFS_DATA_TABLE, type FactionActivityLevelData } from './factionActivityLevelDefsDataTable'

/**
 * Activity level definition.
 * Contains all configuration data for a faction activity level.
 */
export type FactionActivityLevelDef = {
  ord: FactionActivityLevelOrd
  name: string
  minTurns: number
  maxTurns: number
  operationFrequencyMin: number
  operationFrequencyMax: number
  operationLevelWeights: [number, number, number, number, number, number]
}

export const factionActivityLevelDefs: FactionActivityLevelDef[] = toFactionActivityLevelDefsCollection(
  FACTION_ACTIVITY_LEVEL_DEFS_DATA_TABLE,
)

export function getFactionActivityLevelDefByOrd(ord: FactionActivityLevelOrd): FactionActivityLevelDef {
  const found = factionActivityLevelDefs.find((level) => level.ord === ord)
  assertDefined(found, `Activity level with ord ${ord} not found`)
  return found
}

function getFrequency(freq: number | ''): number {
  if (freq === '') {
    return Infinity
  }
  return freq
}

function getOperationLevelWeight(weight: number | ''): number {
  if (weight === '') {
    return 0
  }
  return weight
}

function getOperationLevelWeights(data: FactionActivityLevelData): [number, number, number, number, number, number] {
  return [
    getOperationLevelWeight(data.level1ProbPct),
    getOperationLevelWeight(data.level2ProbPct),
    getOperationLevelWeight(data.level3ProbPct),
    getOperationLevelWeight(data.level4ProbPct),
    getOperationLevelWeight(data.level5ProbPct),
    getOperationLevelWeight(data.level6ProbPct),
  ]
}

function toFactionActivityLevelDefsCollection(data: FactionActivityLevelData[]): FactionActivityLevelDef[] {
  return data.map((row) => ({
    ord: row.ord,
    name: row.name,
    minTurns: row.turnsMin,
    maxTurns: row.turnsMax,
    operationFrequencyMin: getFrequency(row.frequencyMin),
    operationFrequencyMax: getFrequency(row.frequencyMax),
    operationLevelWeights: getOperationLevelWeights(row),
  }))
}
