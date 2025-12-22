import { assertTrue } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import type { MissionDataId } from '../model/missionModel'
import type { FactionData } from './factionsDataTable'

// KJA2 rename this to dataTablesPrivateUtils

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
