import type { FactionOperation } from '../model/factionModel'
import { assertDefined } from '../primitives/assertPrimitives'
import { FACTION_OPERATIONS_DATA_TABLE, type FactionOperationData } from './factionsDataTable'

export const factionOperations: FactionOperation[] = toFactionOperationsCollection(FACTION_OPERATIONS_DATA_TABLE)

export function getFactionOperationByLevel(level: number): FactionOperation {
  const found = factionOperations.find((op) => op.level === level)
  assertDefined(found, `Faction operation with level ${level} not found`)
  return found
}

function toFactionOperationsCollection(data: FactionOperationData[]): FactionOperation[] {
  return data.map((row) => ({
    level: row.level,
    description: row.description,
    panicIncreasePct: row.panicIncreasePct,
    moneyReward: row.moneyReward,
    fundingReward: row.fundingReward,
    fundingPenalty: row.fundingPenalty,
  }))
}
