import type { StateWithHistory } from 'redux-undo'
import type { BasicIntellectState } from './aiStateSlice'
import type { GameState } from '../../lib/model/gameStateModel'

// Action type for compacting history after turn advancement
export const COMPACT_HISTORY = 'undoable/COMPACT_HISTORY'
export function compactHistory(): { type: typeof COMPACT_HISTORY } {
  return { type: COMPACT_HISTORY }
}

// Keep all states for the last 3 turns (N, N-1, N-2)
// Compact older turns (N-3 and earlier) to only their final state
export const RECENT_TURNS_TO_KEEP = 3

// Define explicit types for the state structure
// This type is also used by rootReducer.ts
export type UndoableCombinedState = {
  gameState: GameState
  aiState: BasicIntellectState
}

/**
 * Compacts the undo history by:
 * - Keeping all states for the last 3 turns (N, N-1, N-2)
 * - Keeping only the last state (highest actionsCount) for turns N-3 and earlier
 */
export function compactHistoryState(
  state: StateWithHistory<UndoableCombinedState>,
): StateWithHistory<UndoableCombinedState> {
  const currentTurn = state.present.gameState.turn
  // Turns at or below this threshold will be compacted to only their final state
  const oldTurnThreshold = currentTurn - RECENT_TURNS_TO_KEEP

  // If threshold is 0 or less, no compaction needed (we're in early turns)
  if (oldTurnThreshold <= 0) {
    return state
  }

  // Group past states by turn
  const statesByTurn = new Map<number, UndoableCombinedState[]>()
  for (const pastState of state.past) {
    const turn = pastState.gameState.turn
    const existing = statesByTurn.get(turn)
    if (existing) {
      existing.push(pastState)
    } else {
      statesByTurn.set(turn, [pastState])
    }
  }

  // Build compacted past array
  const compactedPast: UndoableCombinedState[] = []

  // Process turns in order (oldest first) to maintain chronological order
  const sortedTurns = [...statesByTurn.keys()].toSorted((a, b) => a - b)

  for (const turn of sortedTurns) {
    const turnStates = statesByTurn.get(turn)
    if (!turnStates) {
      continue
    }
    if (turn <= oldTurnThreshold) {
      // Old turn: keep only the state with highest actionsCount (the final state of that turn)
      const finalState = turnStates.reduce((best, current) =>
        current.gameState.actionsCount > best.gameState.actionsCount ? current : best,
      )
      compactedPast.push(finalState)
    } else {
      // Recent turn: keep all states, maintaining their original order
      // States are already in chronological order from the original past array iteration
      compactedPast.push(...turnStates)
    }
  }

  return {
    ...state,
    past: compactedPast,
  }
}
