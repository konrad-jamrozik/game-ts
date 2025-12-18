// KJA1 rename to factionActivityLevelUtils
import {
  ACTIVITY_LEVEL_NAMES,
  type FactionActivityLevelOrd,
  type FactionActivityLevelName,
} from '../model/factionModel'

/**
 * Get the display name for an activity level.
 */
export function getActivityLevelName(level: FactionActivityLevelOrd): FactionActivityLevelName {
  return ACTIVITY_LEVEL_NAMES[level]
}
