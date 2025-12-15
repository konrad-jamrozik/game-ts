import { useAppSelector } from '../../redux/hooks'
import type { MissionId } from '../../lib/model/missionModel'
import type { MissionReport } from '../../lib/model/turnReportModel'

export function useMissionReport(missionId: MissionId): MissionReport | undefined {
  return useAppSelector((state) => {
    // Search current turn report first
    const currentReport = state.undoable.present.gameState.turnStartReport
    let found = currentReport?.missions.find((m) => m.missionId === missionId)
    if (found) return found

    // Search past turn reports
    for (const pastState of state.undoable.past) {
      const pastReport = pastState.gameState.turnStartReport
      found = pastReport?.missions.find((m) => m.missionId === missionId)
      if (found) return found
    }

    return found
  })
}
