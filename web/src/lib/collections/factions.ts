import type { ActivityLevel, Faction } from '../model/model'
import type { FactionId } from '../model/missionSiteModel'
import { assertDefined } from '../primitives/assertPrimitives'
import { calculateOperationTurns } from '../ruleset/activityLevelRuleset'

export type FactionDefinition = {
  id: FactionId
  name: string
  shortId: string
  /**
   * Initial activity level when game starts.
   * 0 = Dormant, 1 = Faint, etc.
   */
  initialActivityLevel: ActivityLevel
}

export const factionDefinitions: FactionDefinition[] = [
  { id: 'faction-red-dawn', name: 'Red Dawn', shortId: 'red-dawn', initialActivityLevel: 1 },
  { id: 'faction-exalt', name: 'Exalt', shortId: 'exalt', initialActivityLevel: 0 },
  { id: 'faction-black-lotus', name: 'Black Lotus', shortId: 'black-lotus', initialActivityLevel: 0 },
]

export const factions: Faction[] = factionDefinitions.map((def) => ({
  id: def.id,
  name: def.name,
  activityLevel: def.initialActivityLevel,
  turnsAtCurrentLevel: 0,
  turnsUntilNextOperation: calculateOperationTurns(def.initialActivityLevel),
  suppressionTurns: 0,
  lastOperationTypeName: undefined,
  discoveryPrerequisite: [`lead-${def.shortId}-profile`],
}))

export function getFactionById(factionId: string): Faction {
  const foundFaction = factions.find((faction) => faction.id === factionId)
  assertDefined(foundFaction, `Faction with id ${factionId} not found`)
  return foundFaction
}
