import { ALL_MISSION_STATES, type MissionState } from '../model/outcomeTypes'

/**
 * Helper to get state display order (lower number = displayed first)
 */
export function getMissionStateDisplayOrd(state: MissionState): number {
  return stateToDisplayOrdMap.get(state) ?? 999
}

/**
 * Map of display order to states (lower number = displayed first)
 * Must include ALL possible MissionState values
 */
const missionStateDisplayOrdMap: Record<number, MissionState[]> = {
  0: ['Won', 'Wiped', 'Retreated'], // Display this first
  1: ['Expired'], // Display this last
  2: ['Deployed'],
  3: ['Active'],
}

/**
 * Reverse lookup map: state -> display order
 */
const stateToDisplayOrdMap = new Map<MissionState, number>(
  Object.entries(missionStateDisplayOrdMap).flatMap(([displayOrd, states]) =>
    states.map((state) => [state, Number.parseInt(displayOrd, 10)] as [MissionState, number]),
  ),
)

/**
 * Exhaustiveness check: ensure all MissionState values are in the display order map.
 * Called during app initialization to catch configuration errors early.
 */
export function assertExhaustiveMissionStateDisplayOrdMap(): void {
  const mappedStates = new Set<MissionState>(stateToDisplayOrdMap.keys())
  const allStates = new Set<MissionState>(ALL_MISSION_STATES)

  const missingStates = ALL_MISSION_STATES.filter((state) => !mappedStates.has(state))
  if (missingStates.length > 0) {
    throw new Error(
      `missionStateDisplayOrdMap is missing states: ${missingStates.join(', ')}. All MissionState values must be included.`,
    )
  }

  const extraStates = [...mappedStates].filter((state) => !allStates.has(state))
  if (extraStates.length > 0) {
    throw new Error(
      `missionStateDisplayOrdMap contains invalid states: ${extraStates.join(', ')}. Only MissionState values are allowed.`,
    )
  }
}
