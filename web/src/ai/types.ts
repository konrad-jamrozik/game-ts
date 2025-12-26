import type { GameState } from '../lib/model/gameStateModel'
import type { AppDispatch } from '../redux/store'

export type AIPlayerIntellect = {
  name: string
  playTurn: (getState: () => GameState, dispatch: AppDispatch) => void
}
