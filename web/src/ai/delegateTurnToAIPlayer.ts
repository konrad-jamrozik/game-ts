import { getStore, type AppStore } from '../redux/store'
import { advanceTurn } from '../redux/slices/gameStateSlice'
import { getPlayTurnApi } from '../redux/playTurnApi'
import { isGameEnded } from '../lib/game_utils/gameStateChecks'
import { getIntellect } from './intellectRegistry'

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

export function delegateTurnsToAIPlayer(intellectName: string, turnCount: number): void {
  const store = getStore()
  const autoAdvanceTurn = store.getState().selection.autoAdvanceTurn ?? false
  const timingData: { Turn: number; 'AI MS': number; 'Advance MS': number | undefined }[] = []

  for (let i = 0; i < turnCount; i += 1) {
    const currentState = store.getState().undoable.present.gameState
    if (isGameEnded(currentState)) {
      break
    }

    const turnNumber = i + 1

    // Measure delegateTurnToAIPlayer
    const delegateStart = performance.now()
    delegateTurnToAIPlayer(intellectName)
    const delegateEnd = performance.now()
    const delegateMs = Math.round(delegateEnd - delegateStart)

    // Only advance turn if auto-advance is disabled, since delegateTurnToAIPlayer
    // already handles turn advancement when auto-advance is enabled
    let advanceMs: number | undefined = undefined
    if (!autoAdvanceTurn) {
      const afterState = store.getState().undoable.present.gameState
      if (!isGameEnded(afterState)) {
        // Measure dispatchAdvanceTurn
        const advanceStart = performance.now()
        dispatchAdvanceTurn(store)
        const advanceEnd = performance.now()
        advanceMs = Math.round(advanceEnd - advanceStart)
      }
    }

    timingData.push({
      Turn: turnNumber,
      'AI MS': delegateMs,
      'Advance MS': advanceMs,
    })
  }

  console.table(timingData)
}

function dispatchAdvanceTurn(store: AppStore): void {
  store.dispatch(advanceTurn())
}
