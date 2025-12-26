import { store } from '../redux/store'
import { advanceTurn } from '../redux/slices/gameStateSlice'
import { isGameOver, isGameWon } from '../lib/game_utils/gameStateChecks'
import { getIntellect } from './intellectRegistry'
import type { GameState } from '../lib/model/gameStateModel'

export function delegateTurnToAIPlayer(intellectName: string): void {
  const intellect = getIntellect(intellectName)
  const getState = (): GameState => store.getState().undoable.present.gameState

  intellect.playTurn(getState, store.dispatch)

  const finalState = getState()
  if (!isGameOver(finalState) && !isGameWon(finalState)) {
    store.dispatch(advanceTurn())
  }
}
