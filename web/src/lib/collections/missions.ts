/* eslint-disable @typescript-eslint/prefer-destructuring */
import { toF6 } from '../primitives/fixed6'
import type { Mission, MissionDef, MissionDefId, MissionId } from '../model/missionModel'
import { expandTemplateString, getFactionShortId } from './factions'
import { FACTION_DATA, type FactionStats } from './factionStatsTables'
import {
  OFFENSIVE_MISSIONS_DATA,
  DEFENSIVE_MISSIONS_DATA,
  type OffensiveMissionStats,
  type DefensiveMissionStats,
} from './missionStatsTables'
import type { GameState } from '../model/gameStateModel'
import { assertDefined } from '../primitives/assertPrimitives'

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

/**
 * Generates a mission definition ID from a mission name and faction.
 * @param name - The mission name (e.g., "Apprehend Cult Member")
 * @param faction - The faction stats
 * @returns A mission definition ID (e.g., "mission-def-apprehend-cult-member-rd")
 */
export function generateMissionDefId(name: string, faction: FactionStats): MissionDefId {
  const baseId = name.toLowerCase().replaceAll(' ', '-')
  const shortId = getFactionShortId(faction.id)
  return `mission-def-${baseId}-${shortId}` as MissionDefId
}

// KJA3 should be called bldMissionDefs
function generateMissionDefsForFaction(faction: FactionStats): MissionDef[] {
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
      id: generateMissionDefId(name, faction),
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

export const offensiveMissionDefs: MissionDef[] = FACTION_DATA.flatMap((faction) =>
  generateMissionDefsForFaction(faction),
)

// KJA3 rename, bld
function generateDefensiveMissionDefsForFaction(faction: FactionStats): MissionDef[] {
  return DEFENSIVE_MISSIONS_DATA.map((stats: DefensiveMissionStats) => {
    const name = stats.name
    const expiresIn = stats.expiresIn

    return {
      id: generateMissionDefId(name, faction),
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

export const defensiveMissionDefs: MissionDef[] = FACTION_DATA.flatMap((faction) =>
  generateDefensiveMissionDefsForFaction(faction),
)

export function getMissionById(missionId: MissionId, gameState: GameState): Mission {
  const foundMission = gameState.missions.find((mission) => mission.id === missionId)
  assertDefined(foundMission, `Mission with id ${missionId} not found`)
  return foundMission
}

export function getMissionDefById(missionDefId: MissionDefId): MissionDef {
  const foundOffensiveMissionDef = offensiveMissionDefs.find((missionDef) => missionDef.id === missionDefId)
  if (foundOffensiveMissionDef) {
    return foundOffensiveMissionDef
  }

  const foundDefensiveMissionDef = defensiveMissionDefs.find((missionDef) => missionDef.id === missionDefId)
  if (foundDefensiveMissionDef) {
    return foundDefensiveMissionDef
  }

  throw new Error(`Mission definition with id ${missionDefId} not found`)
}
