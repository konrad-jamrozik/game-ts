import { dataTables } from '../data_tables/dataTables'
import type { Faction, FactionId, FactionDataId } from '../model/factionModel'
import type { FactionData } from '../data_tables/factionsDataTable'
import { calculateOperationTurns } from '../ruleset/factionOperationLevelRuleset'

/**
 * Prototype faction with all default values.
 * Used as a reference for initial faction properties.
 */
export const initialFaction: Faction = {
  id: 'faction-red-dawn' as FactionId,
  factionDataId: 'factiondata-ini' as FactionDataId,
  activityLevel: 0,
  turnsAtCurrentLevel: 0,
  turnsUntilNextOperation: 0,
  suppressionTurns: 0,
  lastOperationTypeName: undefined,
}

type CreateFactionParams = Partial<Faction> & {
  factionDataId: Faction['factionDataId']
}

/**
 * Builds all factions from data tables
 */
export function bldFactions(): Faction[] {
  return dataTables.factions.map((datum) => bldFaction(datum))
}

/**
 * Builds a single faction from faction data.
 * Returns the created faction. The caller is responsible for adding it to state.
 */
export function bldFaction(datum: FactionData): Faction {
  const params: CreateFactionParams = {
    id: datum.id,
    factionDataId: datum.factionDataId,
    activityLevel: datum.initialActivityLevel,
    turnsUntilNextOperation: calculateOperationTurns(datum.initialActivityLevel),
  }

  // Start with initialFaction and override with provided values
  const faction: Faction = {
    ...initialFaction,
    ...params,
  }

  return faction
}
