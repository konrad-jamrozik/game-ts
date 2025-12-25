import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from './dataTables'
import type { Faction, FactionActivityLevelOrd } from '../model/factionModel'
import type { Lead } from '../model/leadModel'
import type { EnemyType } from '../model/enemyModel'
import type { FactionDataId, FactionId, LeadId, MissionDataId } from '../model/modelIds'
import type { FactionData } from './factionsDataTable'
import type { OffensiveMissionData } from './offensiveMissionsDataTable'
import type { DefensiveMissionData } from './defensiveMissionsDataTable'
import type { FactionActivityLevelData } from './factionActivityLevelsDataTable'
import type { EnemyData } from './enemiesDataTable'
import type { FactionOperationLevelData } from './factionOperationLevelsDataTable'

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
