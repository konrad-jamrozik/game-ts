/**
 * Centralized data tables
 *
 * This module provides a single `dataTables` constant that contains all immutable game data.
 * All data is initialized once via `bldDataTables()` and never changed.
 *
 * Template expansion (e.g., `{facId}`, `{facName}`) happens during initialization.
 */

import { assertDefined, assertTrue } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import type { FactionId, FactionActivityLevelOrd } from '../model/factionModel'
import type { MissionDataId, EnemyType } from '../model/missionModel'
import type { LeadId, Lead } from '../model/leadModel'
import { assertIsLeadId } from '../model/modelAssertions'
import { bldFactionsTable, type FactionData } from './factionsDataTable'
import { bldLeadsTable, type LeadData } from './leadsDataTable'
import { bldOffensiveMissionsTable, type OffensiveMissionData } from './offensiveMissionsDataTable'
import { bldDefensiveMissionsTable, type DefensiveMissionData } from './defensiveMissionsDataTable'
import { bldActivityLevelsTable, type FactionActivityLevelData } from './factionActivityLevelsDataTable'
import { bldFactionOperationsTable, type FactionOperationData } from './factionOperationsDataTable'

// KJA1 why this type in addition to FactionActivityLevelData?
export type ProcessedFactionActivityLevelData = Omit<
  FactionActivityLevelData,
  | 'frequencyMin'
  | 'frequencyMax'
  | 'level1ProbPct'
  | 'level2ProbPct'
  | 'level3ProbPct'
  | 'level4ProbPct'
  | 'level5ProbPct'
  | 'level6ProbPct'
> & {
  frequencyMin: number
  frequencyMax: number
  level1ProbPct: number
  level2ProbPct: number
  level3ProbPct: number
  level4ProbPct: number
  level5ProbPct: number
  level6ProbPct: number
  minTurns: number
  maxTurns: number
  operationFrequencyMin: number
  operationFrequencyMax: number
  operationLevelWeights: [number, number, number, number, number, number]
}
import { bldEnemiesTable, type EnemyData } from './enemiesDataTable'

export type DataTables = {
  readonly factions: readonly FactionData[]
  readonly leads: readonly Lead[]
  readonly offensiveMissions: readonly OffensiveMissionData[]
  readonly defensiveMissions: readonly DefensiveMissionData[]
  readonly activityLevels: readonly ProcessedFactionActivityLevelData[]
  readonly enemies: readonly EnemyData[]
  readonly factionOperations: readonly FactionOperationData[]
}

export const dataTables: DataTables = bldDataTables()

export function bldDataTables(): DataTables {
  // Build base data tables (no template expansion yet)
  const rawFactions = bldFactionsTable()
  const rawLeads = bldLeadsTable()
  const rawOffensiveMissions = bldOffensiveMissionsTable()
  const rawDefensiveMissions = bldDefensiveMissionsTable()
  const rawActivityLevels = bldActivityLevelsTable()
  const enemies = bldEnemiesTable()
  const factionOperations = bldFactionOperationsTable()

  // Expand templates using factions
  const factions = rawFactions as readonly FactionData[]
  const leads = expandLeads(rawLeads, factions) as readonly Lead[]
  const offensiveMissions = expandOffensiveMissions(rawOffensiveMissions, factions) as readonly OffensiveMissionData[]
  const defensiveMissions = expandDefensiveMissions(rawDefensiveMissions, factions) as readonly DefensiveMissionData[]
  const activityLevels = processActivityLevels(rawActivityLevels) as readonly ProcessedFactionActivityLevelData[]

  return {
    factions,
    leads,
    offensiveMissions,
    defensiveMissions,
    activityLevels,
    enemies: enemies as readonly EnemyData[],
    factionOperations: factionOperations as readonly FactionOperationData[],
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

export function getActivityLevelByOrd(ord: FactionActivityLevelOrd): ProcessedFactionActivityLevelData {
  const found = dataTables.activityLevels.find((level) => level.ord === ord)
  assertDefined(found, `Activity level with ord ${ord} not found`)
  return found
}

export function getEnemyByType(type: EnemyType): EnemyData {
  const found = dataTables.enemies.find((enemy) => enemy.name === type)
  assertDefined(found, `Enemy with type ${type} not found`)
  return found
}

export function getFactionOperationByLevel(level: number): FactionOperationData {
  const found = dataTables.factionOperations.find((op) => op.level === level)
  assertDefined(found, `Faction operation with level ${level} not found`)
  return found
}

function expandTemplateString(template: string, faction?: FactionData): string {
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

function bldMissionDataId(templatedName: string): MissionDataId {
  const baseId = templatedName.toLowerCase().replaceAll(' ', '-')
  return `missiondata-${baseId}`
}

function expandOffensiveMissions(
  rawMissions: Omit<OffensiveMissionData, 'id' | 'factionId'>[],
  factions: readonly FactionData[],
): OffensiveMissionData[] {
  const result: OffensiveMissionData[] = []

  for (const faction of factions) {
    for (const rawMission of rawMissions) {
      const templatedName = expandTemplateString(rawMission.name, faction)

      result.push({
        id: bldMissionDataId(templatedName),
        name: templatedName,
        description: expandTemplateString(rawMission.description, faction),
        level: rawMission.level,
        expiresIn: rawMission.expiresIn,
        initiate: rawMission.initiate,
        operative: rawMission.operative,
        soldier: rawMission.soldier,
        elite: rawMission.elite,
        handler: rawMission.handler,
        lieutenant: rawMission.lieutenant,
        commander: rawMission.commander,
        highCommander: rawMission.highCommander,
        cultLeader: rawMission.cultLeader,
        moneyReward: rawMission.moneyReward,
        fundingReward: rawMission.fundingReward,
        panicReductionPct: rawMission.panicReductionPct,
        suppression: rawMission.suppression,
        dependsOn: rawMission.dependsOn.map((dep) => expandTemplateString(dep, faction)),
        factionId: faction.id,
      })
    }
  }

  return result
}

function expandDefensiveMissions(
  rawMissions: Omit<DefensiveMissionData, 'id' | 'factionId'>[],
  factions: readonly FactionData[],
): DefensiveMissionData[] {
  const result: DefensiveMissionData[] = []

  for (const faction of factions) {
    for (const rawMission of rawMissions) {
      const templatedName = expandTemplateString(rawMission.name, faction)

      result.push({
        id: bldMissionDataId(templatedName),
        name: templatedName,
        level: rawMission.level,
        expiresIn: rawMission.expiresIn,
        initiate: rawMission.initiate,
        operative: rawMission.operative,
        soldier: rawMission.soldier,
        elite: rawMission.elite,
        handler: rawMission.handler,
        lieutenant: rawMission.lieutenant,
        commander: rawMission.commander,
        highCommander: rawMission.highCommander,
        cultLeader: rawMission.cultLeader,
        factionId: faction.id,
      })
    }
  }

  return result
}

function expandLeads(rawLeads: LeadData[], factions: readonly FactionData[]): Lead[] {
  const result: Lead[] = []

  for (const datum of rawLeads) {
    if (datum.id.includes('{facId}')) {
      // Faction-specific lead: generate for each faction
      for (const faction of factions) {
        const leadId = expandTemplateString(datum.id, faction)
        assertIsLeadId(leadId)
        result.push({
          id: leadId,
          name: expandTemplateString(datum.name, faction),
          description: expandTemplateString(datum.description, faction),
          difficulty: datum.difficulty,
          dependsOn: datum.dependsOn.map((dep) => expandTemplateString(dep, faction)),
          repeatable: datum.repeatable,
          ...(datum.enemyEstimate !== undefined && {
            enemyEstimate: expandTemplateString(datum.enemyEstimate, faction),
          }),
        })
      }
    } else {
      // Static lead: generate once (expandTemplateString will be no-op)
      const leadId = expandTemplateString(datum.id)
      assertIsLeadId(leadId)
      result.push({
        id: leadId,
        name: expandTemplateString(datum.name),
        description: expandTemplateString(datum.description),
        difficulty: datum.difficulty,
        dependsOn: datum.dependsOn.map((dep) => expandTemplateString(dep)),
        repeatable: datum.repeatable,
        ...(datum.enemyEstimate !== undefined && { enemyEstimate: expandTemplateString(datum.enemyEstimate) }),
      })
    }
  }

  return result
}

function getFrequency(freq: number | ''): number {
  if (freq === '') {
    return Infinity
  }
  return freq
}

function getOperationLevelWeight(weight: number | ''): number {
  if (weight === '') {
    return 0
  }
  return weight
}

function processActivityLevels(rawLevels: FactionActivityLevelData[]): ProcessedFactionActivityLevelData[] {
  return rawLevels.map((level) => ({
    ord: level.ord,
    name: level.name,
    turnsMin: level.turnsMin,
    turnsMax: level.turnsMax,
    frequencyMin: getFrequency(level.frequencyMin),
    frequencyMax: getFrequency(level.frequencyMax),
    level1ProbPct: getOperationLevelWeight(level.level1ProbPct),
    level2ProbPct: getOperationLevelWeight(level.level2ProbPct),
    level3ProbPct: getOperationLevelWeight(level.level3ProbPct),
    level4ProbPct: getOperationLevelWeight(level.level4ProbPct),
    level5ProbPct: getOperationLevelWeight(level.level5ProbPct),
    level6ProbPct: getOperationLevelWeight(level.level6ProbPct),
    minTurns: level.turnsMin,
    maxTurns: level.turnsMax,
    operationFrequencyMin: getFrequency(level.frequencyMin),
    operationFrequencyMax: getFrequency(level.frequencyMax),
    operationLevelWeights: [
      getOperationLevelWeight(level.level1ProbPct),
      getOperationLevelWeight(level.level2ProbPct),
      getOperationLevelWeight(level.level3ProbPct),
      getOperationLevelWeight(level.level4ProbPct),
      getOperationLevelWeight(level.level5ProbPct),
      getOperationLevelWeight(level.level6ProbPct),
    ],
  }))
}
