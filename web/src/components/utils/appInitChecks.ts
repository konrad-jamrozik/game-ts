import { showErrorToast } from './errorToast'
import { assertExhaustiveMissionStateDisplayOrdMap } from '../../lib/model_utils/missionStateDisplayOrd'
import { resetBasicIntellectState } from '../../ai/intellects/basicIntellect'

/**
 * Runs all app initialization checks and setup. Call this once after React mounts
 * so that errors are caught and displayed via the error toast snackbar.
 */
export function runAppInit(): void {
  runCheck('MissionState display order map', assertExhaustiveMissionStateDisplayOrdMap)
  resetBasicIntellectState()
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
