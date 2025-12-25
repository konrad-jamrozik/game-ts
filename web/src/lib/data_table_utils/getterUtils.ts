import { assertDefined } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { FactionId, FactionActivityLevelOrd, FactionDataId, Faction } from '../model/factionModel'
import type { MissionDataId } from '../model/missionModel'
import type { EnemyType } from '../model/enemyModel'
import type { Lead, LeadId } from '../model/leadModel'
import type { FactionData } from '../data_tables/factionsDataTable'
import type { OffensiveMissionData } from '../data_tables/offensiveMissionsDataTable'
import type { DefensiveMissionData } from '../data_tables/defensiveMissionsDataTable'
import type { FactionActivityLevelData } from '../data_tables/factionActivityLevelsDataTable'
import type { EnemyData } from '../data_tables/enemiesDataTable'
import type { FactionOperationLevelData } from '../data_tables/factionOperationLevelsDataTable'

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

/**
 * Gets the name of a faction from its FactionData.
 */
export function getFactionName(faction: Faction): string {
  const factionData = getFactionDataByDataId(faction.factionDataId)
  return factionData.name
}

export function getFactionDataByDataId(id: FactionDataId): FactionData {
  const found = dataTables.factions.find((faction) => faction.factionDataId === id)
  assertDefined(found, `Faction data with data id ${id} not found`)
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
