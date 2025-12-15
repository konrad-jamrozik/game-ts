import type { Faction } from '../model/factionModel'
import type { FactionId } from '../model/missionModel'
import { assertDefined, assertTrue } from '../primitives/assertPrimitives'
import { calculateOperationTurns } from '../ruleset/activityLevelRuleset'
import { FACTION_DATA, type FactionStats } from './factionStatsTables'

export function getFactionShortId(factionId: FactionId): string {
  return factionId.replace(/^faction-/u, '')
}

function toFactions(stats: FactionStats[]): Faction[] {
  return stats.map((stat) => bldFaction(stat))
}

function bldFaction(stat: FactionStats): Faction {
  return {
    id: stat.id,
    name: stat.name,
    activityLevel: stat.initialActivityLevel,
    turnsAtCurrentLevel: 0,
    turnsUntilNextOperation: calculateOperationTurns(stat.initialActivityLevel),
    suppressionTurns: 0,
    lastOperationTypeName: undefined,
    discoveryPrerequisite: [`lead-${getFactionShortId(stat.id)}-profile`],
  }
}

export const factions: Faction[] = toFactions(FACTION_DATA)

export function getFactionById(factionId: string): Faction {
  const foundFaction = factions.find((faction) => faction.id === factionId)
  assertDefined(foundFaction, `Faction with id ${factionId} not found`)
  return foundFaction
}

export function expandTemplateString(template: string, faction?: FactionStats): string {
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
