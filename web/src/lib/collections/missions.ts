/* eslint-disable unicorn/no-immediate-mutation */
/* eslint-disable @typescript-eslint/prefer-destructuring */
import { toF6 } from '../primitives/fixed6'
import type { EnemyType, MissionSiteTemplate } from '../model/missionSiteModel'
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

export function missionStatsToEnemyList(stats: EnemyCounts): Partial<Record<EnemyType, number>> {
  const enemyList: Partial<Record<EnemyType, number>> = {}

  enemyList.Initiate = stats.initiate
  enemyList.Operative = stats.operative
  enemyList.Soldier = stats.soldier
  enemyList.Elite = stats.elite
  enemyList.Handler = stats.handler
  enemyList.Lieutenant = stats.lieutenant
  enemyList.Commander = stats.commander
  enemyList.HighCommander = stats.highCommander
  enemyList.CultLeader = stats.cultLeader

  return enemyList
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

// KJA should be called bldMissionSiteTemplates
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

    const enemyList = missionStatsToEnemyList(stats)
    const suppressionValue = parseSuppression(suppression)

    return {
      id: generateMissionId(name, faction),
      name,
      description: expandTemplateString(description, faction),
      expiresIn,
      dependsOn: dependsOn.map((dep) => expandTemplateString(dep, faction)),
      enemyList,
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

function generateDefensiveMissionsForFaction(faction: FactionTemplate): MissionSiteTemplate[] {
  return DEFENSIVE_MISSIONS_DATA.map((stats: DefensiveMissionStats) => {
    const name = stats.name
    const expiresIn = stats.expiresIn

    const enemyList = missionStatsToEnemyList(stats)

    return {
      id: generateMissionId(name, faction),
      name,
      description: '', // Defensive missions don't have descriptions in the data
      expiresIn,
      dependsOn: [], // Defensive missions don't depend on leads
      enemyList,
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
