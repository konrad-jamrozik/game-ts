import type { GameState } from '../lib/model/gameStateModel'
import type { RootReducerState } from './rootReducer'
import type { AppStore } from './store'

export function getCurrentTurnStateFromStore(store: AppStore): GameState {
  /*#__NOINLINE__*/
  return getCurrentTurnState(store.getState())
}

export function getCurrentTurnState(reducerState: RootReducerState): GameState {
  /*#__NOINLINE__*/
  return reducerState.undoable.present.gameState
}
