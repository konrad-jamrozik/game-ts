import type { GameState } from '../lib/model/gameStateModel'
import type { AppDispatch } from '../redux/store'

export type AIPlayerIntellect = {
  name: string
  playTurn: (getState: () => GameState, dispatch: AppDispatch) => void
}

export type AIPlayerIntellectV2 = {
  name: string
  playTurn(api: PlayTurnAPI): void
}

export type PlayTurnAPI = {
  getState: () => GameState
  dispatch: AppDispatch
}
