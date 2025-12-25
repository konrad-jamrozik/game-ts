import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import {
  ACTIVITY_LEVEL_NAMES,
  type FactionActivityLevelOrd,
  type FactionActivityLevelName,
} from '../model/factionModel'
import type { FactionActivityLevelData } from '../data_tables/factionActivityLevelsDataTable'

export function getActivityLevelByOrd(ord: FactionActivityLevelOrd): FactionActivityLevelData {
  const found = dataTables.factionActivityLevels.find((level) => level.ord === ord)
  assertDefined(found, `Activity level with ord ${ord} not found`)
  return found
}

/**
 * Get the display name for an activity level.
 */
export function getActivityLevelName(level: FactionActivityLevelOrd): FactionActivityLevelName {
  return ACTIVITY_LEVEL_NAMES[level]
}
