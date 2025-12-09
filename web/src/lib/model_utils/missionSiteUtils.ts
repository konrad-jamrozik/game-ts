import { getMissionById } from '../collections/missions'
import type { MissionSite, MissionSiteState } from '../model/model'
import { fmtNoPrefix } from '../primitives/formatPrimitives'

/**
 * Filters mission sites by their state
 */
export function filterMissionSitesByState(missionSites: MissionSite[], states: MissionSiteState[]): MissionSite[] {
  return missionSites.filter((site) => states.includes(site.state))
}

/**
 * Gets active or deployed mission sites
 */
export function getActiveOrDeployedMissionSites(missionSites: MissionSite[]): MissionSite[] {
  return filterMissionSitesByState(missionSites, ['Active', 'Deployed'])
}

/**
 * Counts unique agents deployed across all mission sites currently in Deployed state.
 */
export function getDeployedAgentsCount(missionSites: MissionSite[]): number {
  const deployedMissionSites = missionSites.filter((site) => site.state === 'Deployed')
  const deployedAgentIds = deployedMissionSites.flatMap((site) => site.agentIds)
  return new Set(deployedAgentIds).size
}

/**
 * Calculates remaining transport capacity after accounting for deployed agents.
 */
export function getRemainingTransportCap(missionSites: MissionSite[], transportCap: number): number {
  const deployedAgentsCount = getDeployedAgentsCount(missionSites)
  return Math.max(transportCap - deployedAgentsCount, 0)
}

/**
 * Gets archived mission sites (Successful, Failed, or Expired)
 */
export function getArchivedMissionSites(missionSites: MissionSite[]): MissionSite[] {
  return filterMissionSitesByState(missionSites, ['Successful', 'Failed', 'Expired'])
}

/**
 * Sorts mission sites by ID (newest first)
 */
export function sortMissionSitesByIdDesc(missionSites: MissionSite[]): MissionSite[] {
  return missionSites.toSorted((siteA, siteB) => siteB.id.localeCompare(siteA.id))
}

/**
 * Sorts mission sites by state priority and then by ID
 * Active missions come before Deployed, within each group by ID (newest first)
 */
export function sortActiveOrDeployedMissionSites(missionSites: MissionSite[]): MissionSite[] {
  return missionSites.toSorted((siteA, siteB) => {
    // First sort by state: Active missions come before Deployed
    if (siteA.state !== siteB.state) {
      return siteA.state === 'Active' ? -1 : 1
    }
    // Within same state, sort by ID (newest first)
    return siteB.id.localeCompare(siteA.id)
  })
}

/**
 * Validates mission site for agent deployment
 */
export function validateMissionSiteDeployment(missionSite: MissionSite | undefined): {
  isValid: boolean
  errorMessage?: string
} {
  if (!missionSite) {
    return {
      isValid: false,
      errorMessage: 'Mission site not found!',
    }
  }

  if (missionSite.state !== 'Active') {
    return {
      isValid: false,
      errorMessage: 'This mission site is not available for deployment!',
    }
  }

  return { isValid: true }
}

/**
 * Formats mission site ID with mission ID for display
 * @param missionSite - The mission site object
 * @returns Formatted string in the format "{siteId} {missionId}" (e.g., "001 apprehend-red-dawn")
 */
export function fmtMissionSiteIdWithMissionId(missionSite: MissionSite): string {
  const mission = getMissionById(missionSite.missionId)
  const missionSiteIdWithoutPrefix = fmtNoPrefix(missionSite.id, 'mission-site-')
  let missionIdWithoutPrefix = fmtNoPrefix(mission.id, 'mission-')

  const removeFactionName = false
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (removeFactionName) {
    // Remove faction name from mission ID if present
    const factionName = fmtNoPrefix(mission.factionId, 'faction-')
    // Remove faction name from mission ID (e.g., "apprehend-red-dawn" -> "apprehend")
    // Handle both cases: "-faction-name" and "-faction-name-" patterns
    missionIdWithoutPrefix = missionIdWithoutPrefix.replace(new RegExp(`-${factionName}(?=-|$)`, 'u'), '')
  }

  return `${missionSiteIdWithoutPrefix} ${missionIdWithoutPrefix}`
}
