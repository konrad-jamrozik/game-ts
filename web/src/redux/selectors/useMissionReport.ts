import { useAppSelector } from '../hooks'
import type { MissionSiteId } from '../../lib/model/model'
import type { MissionReport } from '../../lib/model/turnReportModel'

export function useMissionReport(missionSiteId: MissionSiteId): MissionReport | undefined {
  return useAppSelector((state) => {
    // Search current turn report first
    const currentReport = state.undoable.present.gameState.turnStartReport
    const found = currentReport?.missions.find((m) => m.missionSiteId === missionSiteId)
    if (found) return found

    // Search past turn reports
    for (const pastState of state.undoable.past) {
      const pastReport = pastState.gameState.turnStartReport
      const pastFound = pastReport?.missions.find((m) => m.missionSiteId === missionSiteId)
      if (pastFound) return pastFound
    }
    return undefined
  })
}
