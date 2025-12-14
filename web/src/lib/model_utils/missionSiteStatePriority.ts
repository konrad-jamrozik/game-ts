import { ALL_MISSION_SITE_STATES, type MissionSiteState } from '../model/outcomeTypes'

/**
 * Helper to get state priority (lower number = higher priority)
 */
export function getStatePriority(state: MissionSiteState): number {
  return stateToPriorityMap.get(state) ?? 999
}

/**
 * Map of priority to states (lower number = higher priority)
 * Must include ALL possible MissionSiteState values
 */
const statePriorityMap: Record<number, MissionSiteState[]> = {
  0: ['Won', 'Wiped', 'Retreated'], // Display this first
  1: ['Expired'], // Display this last
  2: ['Deployed'],
  3: ['Active'],
}

/**
 * Reverse lookup map: state -> priority
 */
const stateToPriorityMap = new Map<MissionSiteState, number>(
  Object.entries(statePriorityMap).flatMap(([priority, states]) =>
    states.map((state) => [state, Number.parseInt(priority, 10)] as [MissionSiteState, number]),
  ),
)

/**
 * Exhaustiveness check: ensure all MissionSiteState values are in the priority map.
 * Called during app initialization to catch configuration errors early.
 */
export function assertExhaustiveStatePriorityMap(): void {
  const mappedStates = new Set<MissionSiteState>(stateToPriorityMap.keys())
  const allStates = new Set<MissionSiteState>(ALL_MISSION_SITE_STATES)

  const missingStates = ALL_MISSION_SITE_STATES.filter((state) => !mappedStates.has(state))
  if (missingStates.length > 0) {
    throw new Error(
      `statePriorityMap is missing states: ${missingStates.join(', ')}. All MissionSiteState values must be included.`,
    )
  }

  const extraStates = [...mappedStates].filter((state) => !allStates.has(state))
  if (extraStates.length > 0) {
    throw new Error(
      `statePriorityMap contains invalid states: ${extraStates.join(', ')}. Only MissionSiteState values are allowed.`,
    )
  }
}
