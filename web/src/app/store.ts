import { configureStore } from '@reduxjs/toolkit'
import { debounce } from 'radash'
import { combineReducers } from 'redux'
import undoable from 'redux-undo'
import counterReducer from '../features/counter/counterSlice'
import eventsReducer from '../model/eventsSlice'
import gameStateReducer from '../model/gameStateSlice'
import selectionReducer from '../model/selectionSlice'
import settingsReducer from '../model/settingsSlice'
import { eventsMiddleware } from './eventsMiddleware'
import { loadPersistedState, saveStateToDexie } from './persist'

export const UNDO_LIMIT = 100

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

// undoable is from https://github.com/omnidan/redux-undo
const undoableReducer = undoable(combinedReducer, {
  // You can pass options to undoable here
  limit: UNDO_LIMIT + 1, // Up to UNDO_LIMIT player actions can be undone/redone
  // Note: because of this filter, we are going to take a snapshot of game state immediately
  // after each player action, including turn advancement.
  // This means that no other events can happen after these events, otherwise they won't
  // be included in the snapshot.
  // If this is needed, possible solution is to group actions together to always start with player action:
  // https://github.com/omnidan/redux-undo#custom-groupby-function
  filter: (action) => isPlayerAction(action),
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
  const { addTextEvent: addEvent } = await import('../model/eventsSlice')
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

// Infer the `RootState` and `AppDispatch` types from the store itself
// Using rootReducer for type source to avoid circular dependency that would otherwise be caused by
//                configureStore
// --depends_on-> loadPersistedState
// --depends_on-> RootState
// --depends_on-> ReturnType<typeof store>
// --depends_on-> configureStore
// See also:
// https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
export type RootState = ReturnType<typeof rootReducer>
// Inferred type: e.g. {posts: PostsState, comments: CommentsState, users: UsersState}

export type AppDispatch = typeof store.dispatch
