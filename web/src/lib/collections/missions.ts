/* eslint-disable @typescript-eslint/prefer-destructuring */
import { toF6 } from '../primitives/fixed6'
import type { Mission } from '../model/model'
import { factionDefinitions, type FactionDefinition } from './factions'
import {
  OFFENSIVE_MISSIONS_DATA,
  DEFENSIVE_MISSIONS_DATA,
  type OffensiveMissionRow,
  type DefensiveMissionRow,
} from './missionStatsTables'

// KJA lots of duplicate code in this file.

function expandTemplateString(template: string, faction: FactionDefinition): string {
  return template.replaceAll('{factionId}', faction.shortId).replaceAll('{factionName}', faction.name)
}

function offensiveMissionRowToEnemySpec(row: OffensiveMissionRow): string {
  const [
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _name,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _level,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _expiresIn,
    initiate,
    operative,
    soldier,
    elite,
    handler,
    lieutenant,
    commander,
    highCommander,
    cultLeader,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _moneyReward,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fundingReward,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _panicReductionPct,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _suppression,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dependsOn,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _description,
  ] = row

  const parts: string[] = []

  if (initiate > 0) parts.push(`${initiate} Initiate`)
  if (operative > 0) parts.push(`${operative} Operative`)
  if (soldier > 0) parts.push(`${soldier} Soldier`)
  if (elite > 0) parts.push(`${elite} Elite`)
  if (handler > 0) parts.push(`${handler} Handler`)
  if (lieutenant > 0) parts.push(`${lieutenant} Lieutenant`)
  if (commander > 0) parts.push(`${commander} Commander`)
  if (highCommander > 0) parts.push(`${highCommander} HighCommander`)
  if (cultLeader > 0) parts.push(`${cultLeader} CultLeader`)

  return parts.join(', ')
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

function generateMissionId(name: string, faction: FactionDefinition): string {
  const baseId = name.toLowerCase().replaceAll(' ', '-')
  return `mission-${baseId}-${faction.shortId}`
}

function generateMissionsForFaction(faction: FactionDefinition): Mission[] {
  return OFFENSIVE_MISSIONS_DATA.map((row: OffensiveMissionRow) => {
    const name = row[0]
    const expiresIn = row[2]
    const moneyReward = row[11]
    const fundingReward = row[12]
    const panicReductionPct = row[13]
    const suppression = row[15]
    const dependsOn = row[16]
    const description = row[17]

    const enemyUnitsSpec = offensiveMissionRowToEnemySpec(row)
    const suppressionValue = parseSuppression(suppression)

    return {
      id: generateMissionId(name, faction),
      title: name,
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

export const offensiveMissions: Mission[] = factionDefinitions.flatMap((faction) => generateMissionsForFaction(faction))

function defensiveMissionRowToEnemySpec(row: DefensiveMissionRow): string {
  const [
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _name,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _level,
    // oxlint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _expiresIn,
    initiate,
    operative,
    soldier,
    elite,
    handler,
    lieutenant,
    commander,
    highCommander,
    cultLeader,
  ] = row

  const parts: string[] = []

  if (initiate > 0) parts.push(`${initiate} Initiate`)
  if (operative > 0) parts.push(`${operative} Operative`)
  if (soldier > 0) parts.push(`${soldier} Soldier`)
  if (elite > 0) parts.push(`${elite} Elite`)
  if (handler > 0) parts.push(`${handler} Handler`)
  if (lieutenant > 0) parts.push(`${lieutenant} Lieutenant`)
  if (commander > 0) parts.push(`${commander} Commander`)
  if (highCommander > 0) parts.push(`${highCommander} HighCommander`)
  if (cultLeader > 0) parts.push(`${cultLeader} CultLeader`)

  return parts.join(', ')
}

function generateDefensiveMissionsForFaction(faction: FactionDefinition): Mission[] {
  return DEFENSIVE_MISSIONS_DATA.map((row) => {
    const name: string = row[0]
    const expiresIn: number = row[2]

    const enemyUnitsSpec = defensiveMissionRowToEnemySpec(row)

    return {
      id: generateMissionId(name, faction),
      title: name,
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

export const defensiveMissions: Mission[] = factionDefinitions.flatMap((faction) =>
  generateDefensiveMissionsForFaction(faction),
)

export function getMissionById(missionId: string): Mission {
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
