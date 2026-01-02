import type { GameState } from '../lib/model/gameStateModel'
import type { RootReducerState } from './rootReducer'
import type { AppStore } from './store'

export function getCurrentTurnStateFromStore(store: AppStore): GameState {
  return getCurrentTurnState(store.getState())
}

export function getCurrentTurnState(reducerState: RootReducerState): GameState {
  return reducerState.undoable.present.gameState
}
