import { store } from '../../redux/store'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { isGameOver, isGameWon } from '../game_utils/gameStateChecks'
import { getIntellect } from './intellectRegistry'

export function delegateTurnToAIPlayer(intellectName: string): void {
  const intellect = getIntellect(intellectName)
  const getState = () => store.getState().undoable.present.gameState

  intellect.playTurn(getState, store.dispatch)

  const finalState = getState()
  if (!isGameOver(finalState) && !isGameWon(finalState)) {
    store.dispatch(advanceTurn())
  }
}
