import { dataTables, getFactionShortId } from '../collections/dataTables'
import type { Faction } from '../model/factionModel'
import type { FactionData } from '../collections/factionsDataTable'
import { calculateOperationTurns } from '../ruleset/activityLevelRuleset'

/**
 * Builds all factions from data tables
 */
export function bldFactions(): Faction[] {
  return dataTables.factions.map((datum) => bldFaction(datum))
}

/**
 * Builds a single faction from faction data
 */
export function bldFaction(datum: FactionData): Faction {
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
