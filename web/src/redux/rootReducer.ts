import { combineReducers } from 'redux'
import undoable from 'redux-undo'
import eventsReducer from './slices/eventsSlice'
import gameStateReducer, { advanceTurn } from './slices/gameStateSlice'
import { isPlayerAction } from './reducers/asPlayerAction'
import selectionReducer from './slices/selectionSlice'
import settingsReducer from './slices/settingsSlice'

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
export const rootReducer = combineReducers({
  undoable: undoableReducer,
  events: eventsReducer, // Events are not wrapped in undoable
  settings: settingsReducer, // Settings are not wrapped in undoable
  selection: selectionReducer, // Selection state is not wrapped in undoable
})
