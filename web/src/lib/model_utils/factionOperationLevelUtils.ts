import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { FactionOperationLevelData } from '../data_tables/factionOperationLevelsDataTable'

export function getFactionOperationByLevel(level: number): FactionOperationLevelData {
  const found = dataTables.factionOperationLevels.find((op) => op.ord === level)
  assertDefined(found, `Faction operation with level ${level} not found`)
  return found
}
