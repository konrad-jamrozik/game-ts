import { configureStore } from '@reduxjs/toolkit'
import { debounce } from 'radash'
import { combineReducers } from 'redux'
import undoable from 'redux-undo'
import eventsReducer from './slices/eventsSlice'
import gameStateReducer, { advanceTurn } from './slices/gameStateSlice'
import { isPlayerAction } from './reducers/asPlayerAction'
import selectionReducer from './slices/selectionSlice'
import settingsReducer from './slices/settingsSlice'
import { eventsMiddleware } from './eventsMiddleware'
import { loadPersistedState, saveStateToDexie } from './persist'

export const UNDO_LIMIT = 100

const combinedReducer = combineReducers({
  gameState: gameStateReducer,
})

// undoable is from https://github.com/omnidan/redux-undo
const undoableReducer = undoable(combinedReducer, {
  // Up to UNDO_LIMIT player actions can be undone/redone.
  // +1 because the current state, which is starting point, must be also accounted for.
  limit: UNDO_LIMIT + 1,
  // Note: because of this filter, we are going to take a snapshot of game state immediately
  // after each player action, and after turn advancement.
  // This means that no other events can happen after these events, otherwise they won't
  // be included in the snapshot.
  // If this is needed, possible solution is to group actions together to always start with player action:
  // https://github.com/omnidan/redux-undo#custom-groupby-function
  // Also ChatGPT-5 advice which appears to be solid:
  // https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/6899963d-0c10-8328-88e5-047f2ee93d88
  filter: (action) => isPlayerAction(action) || advanceTurn.match(action),
})

// Combine undoable and non-undoable reducers
const rootReducer = combineReducers({
  undoable: undoableReducer,
  events: eventsReducer, // Events are not wrapped in undoable
  settings: settingsReducer, // Settings are not wrapped in undoable
  selection: selectionReducer, // Selection state is not wrapped in undoable
})

const maybePersistedState: RootState | undefined = await loadPersistedState()

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(eventsMiddleware()),
  ...(maybePersistedState ? { preloadedState: maybePersistedState } : {}),
})

// If no persisted state was loaded, add a "New game started" event
if (!maybePersistedState) {
  // Import addEvent dynamically to avoid circular dependency
  const { addTextEvent: addEvent } = await import('./slices/eventsSlice')
  const state = store.getState()
  const { gameState } = state.undoable.present

  store.dispatch(
    addEvent({
      message: 'New game started',
      turn: gameState.turn,
      actionsCount: gameState.actionsCount,
    }),
  )
}

const debouncedSave = debounce({ delay: 300 }, async () => {
  await saveStateToDexie(store.getState())
})

store.subscribe(() => {
  debouncedSave()
})

// Here we do
//
//  const maybePersistedState: RootState | undefined = await loadPersistedState()
//  export type RootState = ReturnType<typeof rootReducer>
//
// Instead of:
//
//  export type RootReducerState = ReturnType<typeof rootReducer>
//  const maybePersistedState: RootReducerState | undefined = await loadPersistedState()
//  export type RootState = ReturnType<typeof store.getState>
//
// This way we avoid following circular dependency:
//
//                RootState
// --depends_on-> ReturnType<typeof store.getState> # <- here we broke the circular dependency chain
// --depends_on-> configureStore
// --depends_on-> maybePersistedState
// --depends_on-> loadPersistedState
// --depends_on-> RootState
//
// See also here:
// https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
// This:
//   In cases where type RootState = ReturnType<typeof store.getState> is used,
//   a circular type reference between the middleware and store definitions can be avoided by switching
//   the type definition of RootState to (..)
export type RootState = ReturnType<typeof rootReducer>
// Inferred type: e.g. {posts: PostsState, comments: CommentsState, users: UsersState}

export type AppDispatch = typeof store.dispatch
