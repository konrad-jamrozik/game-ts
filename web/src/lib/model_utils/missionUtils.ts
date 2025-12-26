import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { Mission } from '../model/missionModel'
import type { MissionDataId, MissionId } from '../model/modelIds'
import type { MissionState } from '../model/outcomeTypes'
import type { GameState } from '../model/gameStateModel'
import type { OffensiveMissionData } from '../data_tables/offensiveMissionsDataTable'
import type { DefensiveMissionData } from '../data_tables/defensiveMissionsDataTable'
import { getMissionStateDisplayOrd } from './missionStateDisplayOrd'

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

/**
 * Filters missions by their state
 */
export function filterMissionsByState(missions: Mission[], states: MissionState[]): Mission[] {
  return missions.filter((mission) => states.includes(mission.state))
}

/**
 * Gets active or deployed missions
 */
export function getActiveOrDeployedMissions(missions: Mission[]): Mission[] {
  return filterMissionsByState(missions, ['Active', 'Deployed'])
}

/**
 * Counts unique agents deployed across all missions currently in Deployed state.
 */
export function getDeployedAgentsCount(missions: Mission[]): number {
  const deployedMissions = missions.filter((mission) => mission.state === 'Deployed')
  const deployedAgentIds = deployedMissions.flatMap((mission) => mission.agentIds)
  return new Set(deployedAgentIds).size
}

/**
 * Calculates remaining transport capacity after accounting for deployed agents.
 */
export function getRemainingTransportCap(missions: Mission[], transportCap: number): number {
  const deployedAgentsCount = getDeployedAgentsCount(missions)
  return Math.max(transportCap - deployedAgentsCount, 0)
}

/**
 * Gets archived missions (Won, Wiped, Retreated, or Expired)
 */
export function getArchivedMissions(missions: Mission[]): Mission[] {
  return filterMissionsByState(missions, ['Won', 'Wiped', 'Retreated', 'Expired'])
}

/**
 * Sorts missions by ID (newest first)
 */
export function sortMissionsByIdDesc(missions: Mission[]): Mission[] {
  return missions.toSorted((missionA, missionB) => missionB.id.localeCompare(missionA.id))
}

/**
 * Sorts missions by state display order, then by secondary criteria:
 * - Active missions: by expiresIn ascending (expiring soonest first, 'never' last)
 * - Other states: by ID descending (newest first)
 */
export function sortActiveOrDeployedMissions(missions: Mission[]): Mission[] {
  return missions.toSorted((missionA, missionB) => {
    const displayOrdA = getMissionStateDisplayOrd(missionA.state)
    const displayOrdB = getMissionStateDisplayOrd(missionB.state)

    // First sort by state display order
    if (displayOrdA !== displayOrdB) {
      return displayOrdA - displayOrdB
    }

    // Within Active state, sort by expiresIn ascending
    if (missionA.state === 'Active') {
      return compareExpiresIn(missionA.expiresIn, missionB.expiresIn)
    }

    // Within other states, sort by ID (newest first)
    return missionB.id.localeCompare(missionA.id)
  })
}

/**
 * Compares expiresIn values for ascending sort ('never' is treated as infinity)
 */
function compareExpiresIn(a: number | 'never', b: number | 'never'): number {
  if (a === 'never' && b === 'never') return 0
  if (a === 'never') return 1
  if (b === 'never') return -1
  return a - b
}

/**
 * Validates mission for agent deployment
 */
export function validateMissionDeployment(mission: Mission | undefined): {
  isValid: boolean
  errorMessage?: string
} {
  if (!mission) {
    return {
      isValid: false,
      errorMessage: 'Mission not found!',
    }
  }

  if (mission.state !== 'Active') {
    return {
      isValid: false,
      errorMessage: 'This mission is not available for deployment!',
    }
  }

  return { isValid: true }
}

/**
 * Looks up a mission by ID in the game state
 */
export function getMissionById(missionId: MissionId, gameState: GameState): Mission {
  const foundMission = gameState.missions.find((mission) => mission.id === missionId)
  assertDefined(foundMission, `Mission with id ${missionId} not found`)
  return foundMission
}
