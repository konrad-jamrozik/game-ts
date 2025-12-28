import { store } from '../redux/store'
import { advanceTurn } from '../redux/slices/gameStateSlice'
import { isGameOver, isGameWon } from '../lib/game_utils/gameStateChecks'
import { getIntellect } from './intellectRegistry'
import { getPlayTurnApi } from './playTurnApi'

export function delegateTurnToAIPlayer(intellectName: string): void {
  const intellect = getIntellect(intellectName)

  const api = getPlayTurnApi()
  intellect.playTurn(api)

  const autoAdvanceTurn = store.getState().selection.autoAdvanceTurn ?? false
  if (autoAdvanceTurn) {
    const finalState = api.gameState
    if (!isGameOver(finalState) && !isGameWon(finalState)) {
      store.dispatch(advanceTurn())
    }
  }
}
