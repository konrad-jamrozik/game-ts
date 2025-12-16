import type { Faction, FactionId } from '../model/factionModel'
import { assertDefined, assertTrue } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import { calculateOperationTurns } from '../ruleset/activityLevelRuleset'
import { FACTIONS_DATA_TABLE, type FactionData } from './factionsDataTable'

export function getFactionShortId(factionId: FactionId): string {
  return fmtNoPrefix(factionId, 'faction-')
}

function toFactionsCollection(data: FactionData[]): Faction[] {
  return data.map((datum) => bldFaction(datum))
}

function bldFaction(datum: FactionData): Faction {
  return {
    id: datum.id,
    name: datum.name,
    activityLevel: datum.initialActivityLevel,
    turnsAtCurrentLevel: 0,
    turnsUntilNextOperation: calculateOperationTurns(datum.initialActivityLevel),
    suppressionTurns: 0,
    lastOperationTypeName: undefined,
    discoveryPrerequisite: [`lead-${getFactionShortId(datum.id)}-profile`],
  }
}

export const factions: Faction[] = toFactionsCollection(FACTIONS_DATA_TABLE)

export function getFactionById(factionId: FactionId): Faction {
  const foundFaction = factions.find((faction) => faction.id === factionId)
  assertDefined(foundFaction, `Faction with id ${factionId} not found`)
  return foundFaction
}

export function expandTemplateString(template: string, faction?: FactionData): string {
  if (faction === undefined) {
    assertTrue(
      !template.includes('{facId}') && !template.includes('{facName}'),
      `Template string "${template}" contains faction placeholders but no faction was provided`,
    )
    return template
  }
  const shortId = getFactionShortId(faction.id)
  return template.replaceAll('{facId}', shortId).replaceAll('{facName}', faction.name)
}
