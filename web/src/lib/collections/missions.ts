/* eslint-disable @typescript-eslint/prefer-destructuring */
import { toF6 } from '../primitives/fixed6'
import type { Mission, MissionDef, MissionDefId, MissionId } from '../model/missionModel'
import { expandTemplateString } from './factions'
import { FACTIONS_DATA_TABLE, type FactionData } from './factionsDataTable'
import { OFFENSIVE_MISSIONS_DATA_TABLE, type OffensiveMissionData } from './offensiveMissionsDataTable'
import { DEFENSIVE_MISSIONS_DATA_TABLE, type DefensiveMissionData } from './defensiveMissionsDataTable'
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
 * Generates a mission definition ID from a templated mission name.
 * @param templatedName - The mission name with faction name already templated (e.g., "Apprehend Red Dawn member")
 * @returns A mission definition ID (e.g., "missiondef-apprehend-red-dawn-member")
 */
export function bldMissionDefId(templatedName: string): MissionDefId {
  const baseId = templatedName.toLowerCase().replaceAll(' ', '-')
  return `missiondef-${baseId}`
}

function bldMissionDefsForFaction(faction: FactionData): MissionDef[] {
  return OFFENSIVE_MISSIONS_DATA_TABLE.map((data: OffensiveMissionData) => {
    const templatedName = expandTemplateString(data.name, faction)
    const expiresIn = data.expiresIn
    const moneyReward = data.moneyReward
    const fundingReward = data.fundingReward
    const panicReductionPct = data.panicReductionPct
    const suppression = data.suppression
    const dependsOn = data.dependsOn
    const description = data.description

    const suppressionValue = parseSuppression(suppression)

    return {
      // Example: "Apprehend Red Dawn member" -> "missiondef-apprehend-red-dawn-member"
      id: bldMissionDefId(templatedName),
      name: templatedName,
      description: expandTemplateString(description, faction),
      expiresIn,
      dependsOn: dependsOn.map((dep) => expandTemplateString(dep, faction)),
      enemyCounts: data,
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

export const offensiveMissionDefs: MissionDef[] = FACTIONS_DATA_TABLE.flatMap((faction) =>
  bldMissionDefsForFaction(faction),
)

function bldDefensiveMissionDefsForFaction(faction: FactionData): MissionDef[] {
  return DEFENSIVE_MISSIONS_DATA_TABLE.map((data: DefensiveMissionData) => {
    const templatedName = expandTemplateString(data.name, faction)
    const expiresIn = data.expiresIn

    return {
      // Example: "Foil Red Dawn recruitment push" -> "missiondef-foil-red-dawn-recruitment-push"
      id: bldMissionDefId(templatedName),
      name: templatedName,
      description: '', // Defensive missions don't have descriptions in the data
      expiresIn,
      dependsOn: [], // Defensive missions don't depend on leads
      enemyCounts: data,
      factionId: faction.id,
      rewards: {
        money: 0, // Rewards are calculated dynamically based on operation level
        panicReduction: toF6(0),
        factionRewards: [],
      },
    }
  })
}

export const defensiveMissionDefs: MissionDef[] = FACTIONS_DATA_TABLE.flatMap((faction) =>
  bldDefensiveMissionDefsForFaction(faction),
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
