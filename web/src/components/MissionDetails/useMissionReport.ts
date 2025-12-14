import { useAppSelector } from '../../redux/hooks'
import type { MissionSiteId } from '../../lib/model/missionSiteModel'
import type { MissionReport } from '../../lib/model/turnReportModel'

export function useMissionReport(missionSiteId: MissionSiteId): MissionReport | undefined {
  return useAppSelector((state) => {
    // Search current turn report first
    const currentReport = state.undoable.present.gameState.turnStartReport
    let found = currentReport?.missions.find((m) => m.missionSiteId === missionSiteId)
    if (found) return found

    // Search past turn reports
    for (const pastState of state.undoable.past) {
      const pastReport = pastState.gameState.turnStartReport
      found = pastReport?.missions.find((m) => m.missionSiteId === missionSiteId)
      if (found) return found
    }

    return found
  })
}
