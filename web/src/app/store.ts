import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import undoable from 'redux-undo'
import counterReducer from '../features/counter/counterSlice'
import gameStateReducer from '../model/gameStateSlice'

const combinedReducer = combineReducers({
  counter: counterReducer,
  gameState: gameStateReducer,
})

export const store = configureStore({
  reducer: undoable(combinedReducer, {
    // You can pass options to undoable here
    limit: 10, // Example: limit the history to 10 actions
  }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: e.g. {posts: PostsState, comments: CommentsState, users: UsersState}

export type AppDispatch = typeof store.dispatch
