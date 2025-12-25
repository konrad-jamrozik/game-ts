import { showErrorToast } from './errorToast'
import { assertExhaustiveMissionStatePriorityMap } from '../../lib/model_utils/missionStatePriority'

/**
 * Runs all app initialization checks. Call this once after React mounts
 * so that errors are caught and displayed via the error toast snackbar.
 */
export function runAppInitChecks(): void {
  runCheck('MissionState priority map', assertExhaustiveMissionStatePriorityMap)
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
