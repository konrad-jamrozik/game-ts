import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import undoable from 'redux-undo'
import counterReducer from '../features/counter/counterSlice'
import gameStateReducer from '../model/gameStateSlice'

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

export const store = configureStore({
  // https://github.com/omnidan/redux-undo
  reducer: undoable(combinedReducer, {
    // You can pass options to undoable here
    limit: 100, // Up to 100 player actions can be undone/redone
    // 🚧KJA potential problem with isPlayerAction undo filter:
    // when player action is dispatched, it may result in bunch of events happening after it.
    // The game state should be persisted *AFTER* all those events are processed, not *BEFORE*.
    filter: (action) => isPlayerAction(action) && action.meta.playerAction,
  }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: e.g. {posts: PostsState, comments: CommentsState, users: UsersState}

export type AppDispatch = typeof store.dispatch
