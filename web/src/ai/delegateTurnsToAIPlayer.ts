import { getStore, type AppStore } from '../redux/store'
import { advanceTurn } from '../redux/slices/gameStateSlice'
import { getPlayTurnApi } from '../redux/playTurnApi'
import { getCurrentTurnStateFromStore } from '../redux/storeUtils'
import { isGameEnded } from '../lib/game_utils/gameStateChecks'
import { getIntellect } from './intellectRegistry'
import { profiler } from '../lib/primitives/profiler'

export function delegateTurnsToAIPlayer(intellectName: string, turnCount: number): void {
  const store = getStore()
  const autoAdvanceTurn = store.getState().selection.autoAdvanceTurn ?? false

  for (let i = 0; i < turnCount; i += 1) {
    const currentState = getCurrentTurnStateFromStore(store)
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
      const afterState = getCurrentTurnStateFromStore(store)
      if (!isGameEnded(afterState)) {
        dispatchAdvanceTurn(store)
      }
    }
  }
}

export function delegateTurnToAIPlayer(intellectName: string): void {
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

function dispatchAdvanceTurn(store: AppStore): void {
  store.dispatch(advanceTurn())
}
