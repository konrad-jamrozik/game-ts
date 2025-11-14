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
