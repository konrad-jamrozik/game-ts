import { showErrorToast } from './errorToast'
import { assertExhaustiveMissionStateDisplayOrdMap } from '../../lib/model_utils/missionStateDisplayOrd'
import { store } from '../../redux/store'
import { increaseDesiredCounts } from '../../redux/slices/aiStateSlice'

/**
 * Runs all app initialization checks and setup. Call this once after React mounts
 * so that errors are caught and displayed via the error toast snackbar.
 */
export function runAppInit(): void {
  runCheck('MissionState display order map', assertExhaustiveMissionStateDisplayOrdMap)
  // KJA1 can this be avoided by ensuring the createInitialState() logic in aiStateSlice.ts is doing it?
  // Initialize AI state by increasing desired counts once (matching original behavior)
  // The initial state is already set in the slice, but we need to call increaseDesiredCounts
  // to match the original resetBasicIntellectState behavior
  store.dispatch(increaseDesiredCounts())
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
