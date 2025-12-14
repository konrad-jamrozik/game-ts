/* eslint-disable @typescript-eslint/prefer-destructuring */
import { toF6 } from '../primitives/fixed6'
import type { MissionSiteTemplate } from '../model/missionSiteModel'
import { factionTemplates, type FactionTemplate, expandTemplateString, getFactionShortId } from './factions'
import {
  OFFENSIVE_MISSIONS_DATA,
  DEFENSIVE_MISSIONS_DATA,
  type OffensiveMissionStats,
  type DefensiveMissionStats,
} from './missionStatsTables'

// KJA lots of duplicate code in this file.

type EnemyCounts = {
  initiate: number
  operative: number
  soldier: number
  elite: number
  handler: number
  lieutenant: number
  commander: number
  highCommander: number
  cultLeader: number
}

// KJA inline this function, i.e. avoid having to have an "enemy spec"
/**
 * Converts enemy counts to a spec string format.
 * Example: { initiate: 4, operative: 1, ... } -> "4 Initiate, 1 Operative"
 */
export function enemyCountsToSpec(counts: EnemyCounts): string {
  const parts: string[] = []

  if (counts.initiate > 0) parts.push(`${counts.initiate} Initiate`)
  if (counts.operative > 0) parts.push(`${counts.operative} Operative`)
  if (counts.soldier > 0) parts.push(`${counts.soldier} Soldier`)
  if (counts.elite > 0) parts.push(`${counts.elite} Elite`)
  if (counts.handler > 0) parts.push(`${counts.handler} Handler`)
  if (counts.lieutenant > 0) parts.push(`${counts.lieutenant} Lieutenant`)
  if (counts.commander > 0) parts.push(`${counts.commander} Commander`)
  if (counts.highCommander > 0) parts.push(`${counts.highCommander} HighCommander`)
  if (counts.cultLeader > 0) parts.push(`${counts.cultLeader} CultLeader`)

  return parts.join(', ')
}

function offensiveMissionStatsToEnemySpec(stats: OffensiveMissionStats): string {
  return enemyCountsToSpec({
    initiate: stats.initiate,
    operative: stats.operative,
    soldier: stats.soldier,
    elite: stats.elite,
    handler: stats.handler,
    lieutenant: stats.lieutenant,
    commander: stats.commander,
    highCommander: stats.highCommander,
    cultLeader: stats.cultLeader,
  })
}

function parseSuppression(suppression: string): number {
  if (suppression === 'N/A') {
    return 0
  }
  const match = /^(?<value>\d+)/u.exec(suppression)
  const value = match?.groups?.['value']
  if (value !== undefined && value !== '') {
    return Number.parseInt(value, 10)
  }
  return 0
}

export function generateMissionId(name: string, faction: FactionTemplate): string {
  const baseId = name.toLowerCase().replaceAll(' ', '-')
  const shortId = getFactionShortId(faction.id)
  return `mission-${baseId}-${shortId}`
}

function generateMissionsForFaction(faction: FactionTemplate): MissionSiteTemplate[] {
  return OFFENSIVE_MISSIONS_DATA.map((stats: OffensiveMissionStats) => {
    const name = stats.name
    const expiresIn = stats.expiresIn
    const moneyReward = stats.moneyReward
    const fundingReward = stats.fundingReward
    const panicReductionPct = stats.panicReductionPct
    const suppression = stats.suppression
    const dependsOn = stats.dependsOn
    const description = stats.description

    const enemyUnitsSpec = offensiveMissionStatsToEnemySpec(stats)
    const suppressionValue = parseSuppression(suppression)

    return {
      id: generateMissionId(name, faction),
      name,
      description: expandTemplateString(description, faction),
      expiresIn,
      dependsOn: dependsOn.map((dep) => expandTemplateString(dep, faction)),
      enemyUnitsSpec,
      factionId: faction.id,
      rewards: {
        money: moneyReward,
        funding: fundingReward,
        panicReduction: toF6(panicReductionPct / 100),
        factionRewards:
          suppressionValue > 0
            ? [
                {
                  factionId: faction.id,
                  suppression: suppressionValue,
                },
              ]
            : [],
      },
    }
  })
}

export const offensiveMissions: MissionSiteTemplate[] = factionTemplates.flatMap((faction) =>
  generateMissionsForFaction(faction),
)

function defensiveMissionStatsToEnemySpec(stats: DefensiveMissionStats): string {
  return enemyCountsToSpec({
    initiate: stats.initiate,
    operative: stats.operative,
    soldier: stats.soldier,
    elite: stats.elite,
    handler: stats.handler,
    lieutenant: stats.lieutenant,
    commander: stats.commander,
    highCommander: stats.highCommander,
    cultLeader: stats.cultLeader,
  })
}

function generateDefensiveMissionsForFaction(faction: FactionTemplate): MissionSiteTemplate[] {
  return DEFENSIVE_MISSIONS_DATA.map((stats: DefensiveMissionStats) => {
    const name = stats.name
    const expiresIn = stats.expiresIn

    const enemyUnitsSpec = defensiveMissionStatsToEnemySpec(stats)

    return {
      id: generateMissionId(name, faction),
      name,
      description: '', // Defensive missions don't have descriptions in the data
      expiresIn,
      dependsOn: [], // Defensive missions don't depend on leads
      enemyUnitsSpec,
      factionId: faction.id,
      rewards: {
        money: 0, // Rewards are calculated dynamically based on operation level
        panicReduction: toF6(0),
        factionRewards: [],
      },
    }
  })
}

export const defensiveMissions: MissionSiteTemplate[] = factionTemplates.flatMap((faction) =>
  generateDefensiveMissionsForFaction(faction),
)

export function getMissionById(missionId: string): MissionSiteTemplate {
  const foundOffensiveMission = offensiveMissions.find((mission) => mission.id === missionId)
  if (foundOffensiveMission) {
    return foundOffensiveMission
  }

  const foundDefensiveMission = defensiveMissions.find((mission) => mission.id === missionId)
  if (foundDefensiveMission) {
    return foundDefensiveMission
  }

  throw new Error(`Mission with id ${missionId} not found`)
}
