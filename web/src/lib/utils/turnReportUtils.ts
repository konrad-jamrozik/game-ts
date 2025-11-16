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

export function getCompletedMissionSiteIds(turnReport: TurnReport | undefined): Set<string> {
  const completedIds = new Set<string>()
  if (turnReport?.missions) {
    for (const missionReport of turnReport.missions) {
      completedIds.add(missionReport.missionSiteId)
    }
  }
  // Also include expired mission sites
  if (turnReport?.expiredMissionSites) {
    for (const expiredMissionSite of turnReport.expiredMissionSites) {
      completedIds.add(expiredMissionSite.missionSiteId)
    }
  }
  return completedIds
}
