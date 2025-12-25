/**
 * Centralized data tables
 *
 * This module provides a single `dataTables` constant that contains all immutable game data.
 * All data is initialized once via `bldDataTables()` and never changed.
 *
 * Template expansion (e.g., `{facId}`, `{facName}`) happens during initialization.
 */

import { bldFactionsTable, type FactionData } from './factionsDataTable'
import { bldLeadsTable, type LeadData } from './leadsDataTable'
import { bldOffensiveMissionsTable, type OffensiveMissionData } from './offensiveMissionsDataTable'
import { bldDefensiveMissionsTable, type DefensiveMissionData } from './defensiveMissionsDataTable'
import {
  bldActivityLevelsTable as bldFactionActivityLevelsTable,
  type FactionActivityLevelData,
} from './factionActivityLevelsDataTable'
import { bldFactionOperationLevelsTable, type FactionOperationLevelData } from './factionOperationLevelsDataTable'
import { bldEnemiesTable, type EnemyData } from './enemiesDataTable'

export type DataTables = {
  readonly factions: readonly FactionData[]
  readonly leads: readonly LeadData[]
  readonly offensiveMissions: readonly OffensiveMissionData[]
  readonly defensiveMissions: readonly DefensiveMissionData[]
  readonly factionActivityLevels: readonly FactionActivityLevelData[]
  readonly enemies: readonly EnemyData[]
  readonly factionOperationLevels: readonly FactionOperationLevelData[]
}

export const dataTables: DataTables = bldDataTables()

export function bldDataTables(): DataTables {
  const enemies = bldEnemiesTable()
  const factionOperationLevels = bldFactionOperationLevelsTable()
  const factionActivityLevels = bldFactionActivityLevelsTable()
  const factions = bldFactionsTable()

  const leads = bldLeadsTable(factions)
  const offensiveMissions = bldOffensiveMissionsTable(factions)
  const defensiveMissions = bldDefensiveMissionsTable(factions)

  return {
    factions,
    leads,
    offensiveMissions,
    defensiveMissions,
    factionActivityLevels,
    enemies,
    factionOperationLevels,
  }
}
