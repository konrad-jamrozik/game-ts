import { configureStore } from '@reduxjs/toolkit'
import { debounce, throttle } from 'radash'
import { combineReducers } from 'redux'
import undoable from 'redux-undo'
import counterReducer from '../features/counter/counterSlice'
import gameStateReducer from '../model/gameStateSlice'
import { loadPersistedState, saveStateToDexie } from './persist'

const combinedReducer = combineReducers({
  counter: counterReducer,
  gameState: gameStateReducer,
})

function isPlayerAction(action: unknown): action is { meta: { playerAction: boolean } } {
  return (
    typeof action === 'object' &&
    action !== null &&
    'meta' in action &&
    typeof action.meta === 'object' &&
    action.meta !== null &&
    'playerAction' in action.meta
  )
}

const rootReducer = undoable(combinedReducer, {
  // You can pass options to undoable here
  limit: 100, // Up to 100 player actions can be undone/redone
  // 🚧KJA potential problem with isPlayerAction undo filter:
  // when player action is dispatched, it may result in bunch of events happening after it.
  // The game state should be persisted *AFTER* all those events are processed, not *BEFORE*.
  // Perhaps instead need to group actions together to always start with player action:
  // https://github.com/omnidan/redux-undo#custom-groupby-function
  filter: (action) => isPlayerAction(action) && action.meta.playerAction,
})

export type RootReducerState = ReturnType<typeof rootReducer>

const maybePersistedState: RootReducerState | undefined = await loadPersistedState()

export const store = configureStore({
  // https://github.com/omnidan/redux-undo
  reducer: rootReducer,
  ...(maybePersistedState ? { preloadedState: maybePersistedState } : {}),
})

const debouncedSave = debounce({ delay: 1000 }, async () => {
  await saveStateToDexie(store.getState())
})

store.subscribe(() => {
  debouncedSave()
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: e.g. {posts: PostsState, comments: CommentsState, users: UsersState}

export type AppDispatch = typeof store.dispatch
