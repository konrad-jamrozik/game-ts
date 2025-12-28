import { store } from '../redux/store'
import { advanceTurn } from '../redux/slices/gameStateSlice'
import { getPlayTurnApi } from '../redux/playTurnApi'
import { isGameOver, isGameWon } from '../lib/game_utils/gameStateChecks'
import { getIntellect } from './intellectRegistry'

export function delegateTurnToAIPlayer(intellectName: string): void {
  const intellect = getIntellect(intellectName)

  const api = getPlayTurnApi(store, { strict: true })
  intellect.playTurn(api)

  const autoAdvanceTurn = store.getState().selection.autoAdvanceTurn ?? false
  if (autoAdvanceTurn) {
    const finalState = api.gameState
    if (!isGameOver(finalState) && !isGameWon(finalState)) {
      store.dispatch(advanceTurn())
    }
  }
}

export function delegateTurnsToAIPlayer(intellectName: string, turnCount: number): void {
  for (let i = 0; i < turnCount; i += 1) {
    const currentState = store.getState().undoable.present.gameState
    if (isGameOver(currentState) || isGameWon(currentState)) {
      break
    }
    delegateTurnToAIPlayer(intellectName)
    const afterState = store.getState().undoable.present.gameState
    if (!isGameOver(afterState) && !isGameWon(afterState)) {
      store.dispatch(advanceTurn())
    }
  }
}
