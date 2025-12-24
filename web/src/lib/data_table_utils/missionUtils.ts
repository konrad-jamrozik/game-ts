import { getMissionDataById } from '../data_tables/dataTables'
import type { Mission } from '../model/missionModel'
import { fmtNoPrefix } from '../primitives/formatPrimitives'

// KJA1 "withMissionDefId" is wrong. There is no mission definition ID.
// Overall this seems like it should belong to formatModelUtils.ts, but it cannot due to data table dependency.
/**
 * Formats mission ID with mission ID for display
 * @param mission - The mission object
 * @returns Formatted string in the format "{missionId} {missionDataId}" (e.g., "001 apprehend-red-dawn")
 */
export function fmtMissionIdWithMissionDefId(mission: Mission): string {
  const missionData = getMissionDataById(mission.missionDataId)
  const missionIdWithoutPrefix = fmtNoPrefix(mission.id, 'mission-')
  let missionDataIdWithoutPrefix = fmtNoPrefix(missionData.id, 'missiondata-')

  const removeFactionName = false
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (removeFactionName) {
    // Remove faction name from mission ID if present
    const factionName = fmtNoPrefix(missionData.factionId, 'faction-')
    // Remove faction name from mission ID (e.g., "apprehend-red-dawn" -> "apprehend")
    // Handle both cases: "-faction-name" and "-faction-name-" patterns
    missionDataIdWithoutPrefix = missionDataIdWithoutPrefix.replace(new RegExp(`-${factionName}(?=-|$)`, 'u'), '')
  }

  return `${missionIdWithoutPrefix} ${missionDataIdWithoutPrefix}`
}
