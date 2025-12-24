import { isF6, type Fixed6, f6sub } from '../primitives/fixed6'
import type { TurnReport, ValueChange } from '../model/turnReportModel'

export function getCompletedInvestigationIds(turnReport: TurnReport | undefined): Set<string> {
  const completedIds = new Set<string>()
  if (turnReport?.leadInvestigations) {
    for (const leadInvestigationReport of turnReport.leadInvestigations) {
      if (leadInvestigationReport.completed) {
        completedIds.add(leadInvestigationReport.investigationId)
      }
    }
  }
  return completedIds
}

export function getCompletedMissionIds(turnReport: TurnReport | undefined): Set<string> {
  const completedIds = new Set<string>()
  if (turnReport?.missions) {
    for (const missionReport of turnReport.missions) {
      completedIds.add(missionReport.missionId)
    }
  }
  // Also include expired missions
  if (turnReport?.expiredMissions) {
    for (const expiredMission of turnReport.expiredMissions) {
      completedIds.add(expiredMission.missionId)
    }
  }
  return completedIds
}

// --- Overloads ---
export function bldValueChange(previous: Fixed6, current: Fixed6): ValueChange<Fixed6>
export function bldValueChange(previous: number, current: number): ValueChange

// --- Implementation ---
export function bldValueChange(previous: Fixed6 | number, current: Fixed6 | number): ValueChange<Fixed6> | ValueChange {
  if (isF6(previous) && isF6(current)) {
    return {
      previous,
      current,
      delta: f6sub(current, previous),
    }
  }

  if (typeof previous === 'number' && typeof current === 'number') {
    return {
      previous,
      current,
      delta: current - previous,
    }
  }

  // Exhaustive guard: disallow mixing number with Fixed6
  throw new TypeError('bldValueChange: mixed types (number vs Fixed6) are not allowed.')
}
