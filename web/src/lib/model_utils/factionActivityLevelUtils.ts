import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import {
  ACTIVITY_LEVEL_NAMES,
  type FactionActivityLevelOrd,
  type FactionActivityLevelName,
} from '../model/factionModel'
import type { FactionActivityLevelData } from '../data_tables/factionActivityLevelsDataTable'
import type { Faction } from '../model/factionModel'
import { isFactionTerminated } from './factionUtils'

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

/**
 * Get the effective activity level name for a faction, accounting for termination status.
 * Returns 'Terminated' if the faction has been terminated, otherwise returns the normal activity level name.
 */
export function getEffectiveActivityLevelName(
  faction: Faction,
  leadInvestigationCounts: Record<string, number>,
): FactionActivityLevelName | 'Terminated' {
  if (isFactionTerminated(faction, leadInvestigationCounts)) {
    return 'Terminated'
  }
  return getActivityLevelName(faction.activityLevel)
}
