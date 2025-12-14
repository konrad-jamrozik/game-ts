import type { ActivityLevel, Faction } from '../model/factionModel'
import type { FactionId } from '../model/missionSiteModel'
import { assertDefined } from '../primitives/assertPrimitives'
import { calculateOperationTurns } from '../ruleset/activityLevelRuleset'

export type FactionDefinition = {
  id: FactionId
  name: string
  /**
   * Initial activity level when game starts.
   * 0 = Dormant, 1 = Faint, etc.
   */
  initialActivityLevel: ActivityLevel
}

export const factionDefinitions: FactionDefinition[] = [
  { id: 'faction-red-dawn', name: 'Red Dawn', initialActivityLevel: 1 },
  { id: 'faction-exalt', name: 'Exalt', initialActivityLevel: 0 },
  { id: 'faction-black-lotus', name: 'Black Lotus', initialActivityLevel: 0 },
]

export function getFactionShortId(factionId: FactionId): string {
  return factionId.replace(/^faction-/u, '')
}

export const factions: Faction[] = factionDefinitions.map((def) => ({
  id: def.id,
  name: def.name,
  activityLevel: def.initialActivityLevel,
  turnsAtCurrentLevel: 0,
  turnsUntilNextOperation: calculateOperationTurns(def.initialActivityLevel),
  suppressionTurns: 0,
  lastOperationTypeName: undefined,
  discoveryPrerequisite: [`lead-${getFactionShortId(def.id)}-profile`],
}))

export function getFactionById(factionId: string): Faction {
  const foundFaction = factions.find((faction) => faction.id === factionId)
  assertDefined(foundFaction, `Faction with id ${factionId} not found`)
  return foundFaction
}

export function expandTemplateString(template: string, faction: FactionDefinition): string {
  const shortId = getFactionShortId(faction.id)
  return template.replaceAll('{facId}', shortId).replaceAll('{facName}', faction.name)
}
