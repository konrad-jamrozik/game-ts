import { assertDefined } from '../primitives/assertPrimitives'
import type { ActivityLevelOrd } from '../model/factionModel'
import { FACTION_ACTIVITY_LEVELS_DATA_TABLE, type ActivityLevelData } from './factionActivityLevelDataTable'

// KJA1 rename to FactionActivityLevelDef
/**
 * Activity level definition.
 * Contains all configuration data for a faction activity level.
 */
export type ActivityLevel = {
  ord: ActivityLevelOrd
  name: string
  minTurns: number
  maxTurns: number
  operationFrequencyMin: number
  operationFrequencyMax: number
  operationLevelWeights: [number, number, number, number, number, number]
}

export const factionActivityLevels: ActivityLevel[] = toFactionActivityLevelsCollection(
  FACTION_ACTIVITY_LEVELS_DATA_TABLE,
)

export function getActivityLevelByOrd(ord: ActivityLevelOrd): ActivityLevel {
  const found = factionActivityLevels.find((level) => level.ord === ord)
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

function getOperationLevelWeights(data: ActivityLevelData): [number, number, number, number, number, number] {
  return [
    getOperationLevelWeight(data.level1ProbPct),
    getOperationLevelWeight(data.level2ProbPct),
    getOperationLevelWeight(data.level3ProbPct),
    getOperationLevelWeight(data.level4ProbPct),
    getOperationLevelWeight(data.level5ProbPct),
    getOperationLevelWeight(data.level6ProbPct),
  ]
}

function toFactionActivityLevelsCollection(data: ActivityLevelData[]): ActivityLevel[] {
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
