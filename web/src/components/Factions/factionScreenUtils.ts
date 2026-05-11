import type { Faction } from '../../lib/model/factionModel'
import { isFactionDiscovered } from '../../lib/ruleset/factionRuleset'

export function getVisibleFactions(
  factions: readonly Faction[],
  leadInvestigationCounts: Record<string, number>,
  revealAllFactionProfiles: boolean,
): readonly Faction[] {
  return revealAllFactionProfiles
    ? factions
    : factions.filter((faction) => isFactionDiscovered(faction, leadInvestigationCounts))
}

export function getFactionNextOperationDisplay(faction: Faction, isTerminated: boolean): string {
  if (isTerminated || faction.activityLevel === 0) {
    return '-'
  }

  if (faction.suppressionTurns > 0) {
    return `${faction.turnsUntilNextOperation} (supp: ${faction.suppressionTurns})`
  }

  return String(faction.turnsUntilNextOperation)
}
