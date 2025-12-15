import { getMissionDefById } from '../collections/missions'
import type { Mission } from '../model/missionModel'
import type { MissionState } from '../model/outcomeTypes'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import { getStatePriority } from './missionStatePriority'

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
 * Sorts missions by state priority, then by secondary criteria:
 * - Active missions: by expiresIn ascending (expiring soonest first, 'never' last)
 * - Other states: by ID descending (newest first)
 */
export function sortActiveOrDeployedMissions(missions: Mission[]): Mission[] {
  return missions.toSorted((missionA, missionB) => {
    const priorityA = getStatePriority(missionA.state)
    const priorityB = getStatePriority(missionB.state)

    // First sort by state priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB
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
 * Formats mission ID with mission ID for display
 * @param mission - The mission object
 * @returns Formatted string in the format "{missionId} {missionDefId}" (e.g., "001 apprehend-red-dawn")
 */
export function fmtMissionIdWithMissionDefId(mission: Mission): string {
  const missionDef = getMissionDefById(mission.missionDefId)
  const missionIdWithoutPrefix = fmtNoPrefix(mission.id, 'mission-')
  let missionDefIdWithoutPrefix = fmtNoPrefix(missionDef.id, 'mission-def-')

  const removeFactionName = false
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (removeFactionName) {
    // Remove faction name from mission ID if present
    const factionName = fmtNoPrefix(missionDef.factionId, 'faction-')
    // Remove faction name from mission ID (e.g., "apprehend-red-dawn" -> "apprehend")
    // Handle both cases: "-faction-name" and "-faction-name-" patterns
    missionDefIdWithoutPrefix = missionDefIdWithoutPrefix.replace(new RegExp(`-${factionName}(?=-|$)`, 'u'), '')
  }

  return `${missionIdWithoutPrefix} ${missionDefIdWithoutPrefix}`
}
