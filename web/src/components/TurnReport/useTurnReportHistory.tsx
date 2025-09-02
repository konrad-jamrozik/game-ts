import { useAppSelector } from '../../app/hooks'
import type { TurnReport } from '../../lib/model/reportModel'

/**
 * Hook to access historical turn reports from the undo system
 */
export function useTurnReportHistory(): {
  getTurnReport: (turn: number) => TurnReport | undefined
} {
  const undoableState = useAppSelector((state) => state.undoable)

  function getTurnReport(targetTurn: number): TurnReport | undefined {
    // Check current state first
    const { gameState: currentGameState } = undoableState.present
    if (currentGameState.turn === targetTurn && currentGameState.turnStartReport) {
      return currentGameState.turnStartReport
    }

    // Search through past states
    for (const pastState of undoableState.past) {
      const { gameState } = pastState
      if (gameState.turn === targetTurn && gameState.turnStartReport) {
        return gameState.turnStartReport
      }
    }

    // Search through future states (in case we're looking at an undone state)
    for (const futureState of undoableState.future) {
      const { gameState } = futureState
      if (gameState.turn === targetTurn && gameState.turnStartReport) {
        return gameState.turnStartReport
      }
    }

    return undefined
  }

  return { getTurnReport }
}
