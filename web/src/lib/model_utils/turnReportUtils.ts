import type { TurnReport } from '../model/turnReportModel'

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
