/* eslint-disable @typescript-eslint/prefer-destructuring */
import { toF6 } from '../primitives/fixed6'
import type { MissionSiteDefinition } from '../model/missionSiteModel'
import { expandTemplateString, getFactionShortId } from './factions'
import { FACTION_DATA, type FactionStats } from './factionStatsTables'
import {
  OFFENSIVE_MISSIONS_DATA,
  DEFENSIVE_MISSIONS_DATA,
  type OffensiveMissionStats,
  type DefensiveMissionStats,
} from './missionStatsTables'

// KJA3 lots of duplicate code in this file.

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

export function generateMissionId(name: string, faction: FactionStats): string {
  const baseId = name.toLowerCase().replaceAll(' ', '-')
  const shortId = getFactionShortId(faction.id)
  return `mission-${baseId}-${shortId}`
}

// KJA3 should be called bldMissionSiteDefinitions
function generateMissionsForFaction(faction: FactionStats): MissionSiteDefinition[] {
  return OFFENSIVE_MISSIONS_DATA.map((stats: OffensiveMissionStats) => {
    const name = stats.name
    const expiresIn = stats.expiresIn
    const moneyReward = stats.moneyReward
    const fundingReward = stats.fundingReward
    const panicReductionPct = stats.panicReductionPct
    const suppression = stats.suppression
    const dependsOn = stats.dependsOn
    const description = stats.description

    const suppressionValue = parseSuppression(suppression)

    return {
      id: generateMissionId(name, faction),
      name,
      description: expandTemplateString(description, faction),
      expiresIn,
      dependsOn: dependsOn.map((dep) => expandTemplateString(dep, faction)),
      enemyCounts: stats,
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

export const offensiveMissions: MissionSiteDefinition[] = FACTION_DATA.flatMap((faction) =>
  generateMissionsForFaction(faction),
)

// kja rename, bld
function generateDefensiveMissionsForFaction(faction: FactionStats): MissionSiteDefinition[] {
  return DEFENSIVE_MISSIONS_DATA.map((stats: DefensiveMissionStats) => {
    const name = stats.name
    const expiresIn = stats.expiresIn

    return {
      id: generateMissionId(name, faction),
      name,
      description: '', // Defensive missions don't have descriptions in the data
      expiresIn,
      dependsOn: [], // Defensive missions don't depend on leads
      enemyCounts: stats,
      factionId: faction.id,
      rewards: {
        money: 0, // Rewards are calculated dynamically based on operation level
        panicReduction: toF6(0),
        factionRewards: [],
      },
    }
  })
}

export const defensiveMissions: MissionSiteDefinition[] = FACTION_DATA.flatMap((faction) =>
  generateDefensiveMissionsForFaction(faction),
)

export function getMissionById(missionId: string): MissionSiteDefinition {
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
