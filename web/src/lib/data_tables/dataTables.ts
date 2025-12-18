/**
 * Centralized data tables
 *
 * This module provides a single `dataTables` constant that contains all immutable game data.
 * All data is initialized once via `bldDataTables()` and never changed.
 *
 * Template expansion (e.g., `{facId}`, `{facName}`) happens during initialization.
 */

import { assertDefined } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import type { FactionId, FactionActivityLevelOrd } from '../model/factionModel'
import type { MissionDataId, EnemyType } from '../model/missionModel'
import type { Lead, LeadId } from '../model/leadModel'
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

// Data table lookup utilities
// These functions look up entities in the immutable dataTables constant.

export function getFactionShortId(factionId: FactionId): string {
  return fmtNoPrefix(factionId, 'faction-')
}
export function getOffensiveMissionDataById(id: MissionDataId): OffensiveMissionData {
  const found = dataTables.offensiveMissions.find((mission) => mission.id === id)
  assertDefined(found, `Offensive mission data with id ${id} not found`)
  return found
}

export function getDefensiveMissionDataById(id: MissionDataId): DefensiveMissionData {
  const found = dataTables.defensiveMissions.find((mission) => mission.id === id)
  assertDefined(found, `Defensive mission data with id ${id} not found`)
  return found
}

export function getMissionDataById(id: MissionDataId): OffensiveMissionData | DefensiveMissionData {
  const offensive = dataTables.offensiveMissions.find((mission) => mission.id === id)
  if (offensive) {
    return offensive
  }
  const defensive = dataTables.defensiveMissions.find((mission) => mission.id === id)
  if (defensive) {
    return defensive
  }
  throw new Error(`Mission data with id ${id} not found`)
}

export function getLeadById(id: LeadId): Lead {
  const found = dataTables.leads.find((lead) => lead.id === id)
  assertDefined(found, `Lead with id ${id} not found`)
  return found
}

export function getFactionDataById(id: FactionId): FactionData {
  const found = dataTables.factions.find((faction) => faction.id === id)
  assertDefined(found, `Faction data with id ${id} not found`)
  return found
}

export function getActivityLevelByOrd(ord: FactionActivityLevelOrd): FactionActivityLevelData {
  const found = dataTables.factionActivityLevels.find((level) => level.ord === ord)
  assertDefined(found, `Activity level with ord ${ord} not found`)
  return found
}

export function getEnemyByType(type: EnemyType): EnemyData {
  const found = dataTables.enemies.find((enemy) => enemy.name === type)
  assertDefined(found, `Enemy with type ${type} not found`)
  return found
}

export function getFactionOperationByLevel(level: number): FactionOperationLevelData {
  const found = dataTables.factionOperationLevels.find((op) => op.ord === level)
  assertDefined(found, `Faction operation with level ${level} not found`)
  return found
}
