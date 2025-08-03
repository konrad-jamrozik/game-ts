import type { MissionSite, MissionSiteState } from './model'

/**
 * Domain service for mission site operations and filtering
 */

/**
 * Filters mission sites by their state
 */
export function filterMissionSitesByState(missionSites: MissionSite[], states: MissionSiteState[]): MissionSite[] {
  return missionSites.filter((site) => states.includes(site.state))
}

/**
 * Gets active mission sites (Active or Deployed)
 */
export function getActiveMissionSites(missionSites: MissionSite[]): MissionSite[] {
  return filterMissionSitesByState(missionSites, ['Active', 'Deployed'])
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
  return [...missionSites].sort((siteA, siteB) => siteB.id.localeCompare(siteA.id))
}

/**
 * Sorts mission sites by state priority and then by ID
 * Active missions come before Deployed, within each group by ID (newest first)
 */
export function sortActiveMissionSites(missionSites: MissionSite[]): MissionSite[] {
  return [...missionSites].sort((siteA, siteB) => {
    // First sort by state: Active missions come before Deployed
    if (siteA.state !== siteB.state) {
      return siteA.state === 'Active' ? -1 : 1
    }
    // Within same state, sort by ID (newest first)
    return siteB.id.localeCompare(siteA.id)
  })
}

/**
 * Checks if a mission site is available for deployment
 */
export function canDeployToMissionSite(missionSite: MissionSite): boolean {
  return missionSite.state === 'Active'
}

/**
 * Formats mission site display ID by removing prefixes
 */
export function formatMissionSiteDisplayId(missionSiteId: string): string {
  return missionSiteId.replace(/^mission-site-/u, '')
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
