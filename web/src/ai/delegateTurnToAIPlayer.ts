import { getStore, type AppStore } from '../redux/store'
import { advanceTurn } from '../redux/slices/gameStateSlice'
import { getPlayTurnApi } from '../redux/playTurnApi'
import { isGameEnded } from '../lib/game_utils/gameStateChecks'
import { getIntellect } from './intellectRegistry'
import { profiler } from '../lib/primitives/profiler'

// eslint-disable-next-line camelcase
export const delegateTurnToAIPlayer = _AI_delegateTurnToAIPlayer

// eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
function _AI_delegateTurnToAIPlayer(intellectName: string): void {
  return delegateTurnToAIPlayerImpl(intellectName)
}

function delegateTurnToAIPlayerImpl(intellectName: string): void {
  const intellect = getIntellect(intellectName)
  const store = getStore()

  const api = getPlayTurnApi(store, { strict: true })
  intellect.playTurn(api)

  const autoAdvanceTurn = store.getState().selection.autoAdvanceTurn ?? false
  if (autoAdvanceTurn) {
    const finalState = api.gameState
    if (!isGameEnded(finalState)) {
      store.dispatch(advanceTurn())
    }
  }
}

export function delegateTurnsToAIPlayer(intellectName: string, turnCount: number): void {
  const store = getStore()
  const autoAdvanceTurn = store.getState().selection.autoAdvanceTurn ?? false

  for (let i = 0; i < turnCount; i += 1) {
    const currentState = store.getState().undoable.present.gameState
    if (isGameEnded(currentState)) {
      break
    }

    const turnNumber = i + 1

    // Mark turn boundary for profiler
    profiler.startTurn(turnNumber)

    delegateTurnToAIPlayer(intellectName)

    // Only advance turn if auto-advance is disabled, since delegateTurnToAIPlayer
    // already handles turn advancement when auto-advance is enabled
    if (!autoAdvanceTurn) {
      const afterState = store.getState().undoable.present.gameState
      if (!isGameEnded(afterState)) {
        dispatchAdvanceTurn(store)
      }
    }
  }
}

function dispatchAdvanceTurn(store: AppStore): void {
  store.dispatch(advanceTurn())
}
