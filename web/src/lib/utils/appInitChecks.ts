import { showErrorToast } from './errorToast'
import { assertExhaustiveStatePriorityMap } from '../model_utils/missionSiteStatePriority'

/**
 * Runs all app initialization checks. Call this once after React mounts
 * so that errors are caught and displayed via the error toast snackbar.
 */
export function runAppInitChecks(): void {
  runCheck('MissionSiteState priority map', assertExhaustiveStatePriorityMap)
}

function runCheck(name: string, check: () => void): void {
  try {
    check()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`App init check failed [${name}]:`, error)
    showErrorToast(`Init check failed: ${message}`)
  }
}
