import { combineReducers, type Reducer } from 'redux'
import undoable, { type StateWithHistory } from 'redux-undo'
import eventsReducer, { type EventsState } from './slices/eventsSlice'
import gameStateReducer, { advanceTurn } from './slices/gameStateSlice'
import { isPlayerAction } from './reducer_utils/asPlayerAction'
import selectionReducer, { type SelectionState } from './slices/selectionSlice'
import settingsReducer, { type SettingsState } from './slices/settingsSlice'
import expansionReducer, { type ExpansionState } from './slices/expansionSlice'
import aiStateReducer, { type BasicIntellectState } from './slices/aiStateSlice'
import type { GameState } from '../lib/model/gameStateModel'

export const DEFAULT_UNDO_LIMIT = 500

type RootReducerState = {
  undoable: StateWithHistory<UndoableCombinedState>
  events: EventsState
  settings: SettingsState
  selection: SelectionState
  expansion: ExpansionState
}

// Define explicit types for the state structure
type UndoableCombinedState = {
  gameState: GameState
  aiState: BasicIntellectState
}

export type RootState = RootReducerState

export function createRootReducer(undoLimit: number = DEFAULT_UNDO_LIMIT): Reducer<RootReducerState> {
  // 1. Start by creating a combined reducer having only one `gameState` reducer.
  const combinedReducer = combineReducers({
    gameState: gameStateReducer,
    aiState: aiStateReducer,
  })

  // 2. Now make the `gameState` undoable.
  // undoable is from https://github.com/omnidan/redux-undo
  const undoableReducer = undoable(combinedReducer, {
    // Up to undoLimit player actions can be undone/redone.
    // +1 because the current state, which is starting point, must be also accounted for.
    limit: undoLimit + 1,
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

  // 3. Now actually combine the undoable `gameState` with all the other reducers.
  // Combine undoable and non-undoable reducers
  return combineReducers({
    undoable: undoableReducer,
    events: eventsReducer, // Events are not wrapped in undoable
    settings: settingsReducer, // Settings are not wrapped in undoable
    selection: selectionReducer, // Selection state is not wrapped in undoable
    expansion: expansionReducer, // Expansion state is not wrapped in undoable
  })
}
