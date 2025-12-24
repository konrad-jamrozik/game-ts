import { assertTrue } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import type { MissionDataId } from '../model/missionModel'
import type { FactionId } from '../model/factionModel'
import type { EnemyCounts } from '../model/enemyModel'
import type { FactionData } from './factionsDataTable'

/**
 * Base mission data type containing common properties shared by both
 * offensive and defensive mission data.
 */
export type BaseMissionData = {
  id: MissionDataId
  name: string
  level: number
  expiresIn: number
  enemyCounts: EnemyCounts
  factionId: FactionId
}

export function expandTemplateString(template: string, faction?: FactionData): string {
  if (faction === undefined) {
    assertTrue(
      !template.includes('{facId}') && !template.includes('{facName}'),
      `Template string "${template}" contains faction placeholders but no faction was provided`,
    )
    return template
  }
  const shortId = fmtNoPrefix(faction.id, 'faction-')
  return template.replaceAll('{facId}', shortId).replaceAll('{facName}', faction.name)
}

export function bldMissionDataId(templatedName: string): MissionDataId {
  const baseId = templatedName.toLowerCase().replaceAll(' ', '-')
  return `missiondata-${baseId}`
}
