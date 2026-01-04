---
name: undo history compaction
overview: Implement turn-based history compaction that keeps all player action states for the last 3 turns (N, N-1, N-2) while compacting older turns (N-3 and earlier) to only their final state. Also update the events log to follow the same 3-turn retention policy with a 500 limit.
todos:
  - id: create-compaction
    content: Create historyCompaction.ts with action type, constants (RECENT_TURNS_TO_KEEP=3), and compaction logic function
    status: pending
  - id: wrap-reducer
    content: Wrap undoable reducer in rootReducer.ts to handle COMPACT_HISTORY action
    status: pending
  - id: update-events-slice
    content: "Update eventsSlice.ts: change MAX_EVENTS to 500, add compactEventsByTurn reducer"
    status: pending
  - id: dispatch-compaction
    content: Update eventsMiddleware.ts to dispatch compactHistory() and compactEventsByTurn() after advanceTurn
    status: pending
  - id: update-reset-button
    content: "Update ResetControls.tsx: Reset turn vs Revert turn logic based on actionsThisTurn"
    status: pending
  - id: update-undo-button
    content: "Update ResetControls.tsx: Disable undo when actionsThisTurn === 0"
    status: pending
---

# Undo History Compaction

## Current System

The app uses `redux-undo` library. The undoable state structure:

- `past`: Array of previous states (up to 500 entries via `DEFAULT_UNDO_LIMIT`)
- `present`: Current state  
- `future`: States that were undone

States are recorded on:

- Player actions (via `isPlayerAction` filter)
- Turn advancement (via `advanceTurn.match` filter)

Events are stored in `eventsSlice.ts` with a current limit of 10 (`MAX_EVENTS`).

## Compaction Rules

### Undo History (Game States)

- **Turns N, N-1, N-2** (last 3 turns): Keep ALL player action states
- **Turns N-3 and earlier**: Keep only the **last state** (highest actionsCount) for each turn
- **Overall limit**: 500 game states total (no separate limit for recent turns)

### Events Log

- **Turns N, N-1, N-2** (last 3 turns): Keep all events
- **Turns N-3 and earlier**: Remove all events
- **Overall limit**: 500 events (though 3-turn filter likely keeps it much smaller)

## Key Changes

### 1. Create History Compaction Logic

Create new file [web/src/redux/historyCompaction.ts](web/src/redux/historyCompaction.ts):

```typescript
export const COMPACT_HISTORY = 'undoable/COMPACT_HISTORY'
export const compactHistory = () => ({ type: COMPACT_HISTORY })

const RECENT_TURNS_TO_KEEP = 3 // Keep all states for N, N-1, N-2
```

The `compactHistoryState` function will:

1. Get current turn number from `present.gameState.turn`
2. Calculate cutoff: `oldTurnThreshold = currentTurn - RECENT_TURNS_TO_KEEP` (i.e., N-3)
3. Group past states by turn number
4. For turns <= oldTurnThreshold: keep only the entry with highest actionsCount
5. For turns > oldTurnThreshold (last 3 turns): keep all entries
6. Return modified state with compacted `past` array

### 2. Create Custom Wrapper Reducer

Modify [web/src/redux/rootReducer.ts](web/src/redux/rootReducer.ts) to wrap the undoable reducer:

```typescript
import { COMPACT_HISTORY, compactHistoryState } from './historyCompaction'

function wrapWithCompaction(reducer) {
  return (state, action) => {
    const newState = reducer(state, action)
    
    if (action.type === COMPACT_HISTORY) {
      return compactHistoryState(newState)
    }
    return newState
  }
}
```

The overall 500 limit is already enforced by `redux-undo`'s `limit` option.

### 3. Dispatch Compaction After Turn Advancement

Modify [web/src/redux/eventsMiddleware.ts](web/src/redux/eventsMiddleware.ts) to dispatch `compactHistory()` after `advanceTurn`:

```typescript
import { compactHistory } from './historyCompaction'

if (advanceTurn.match(action)) {
  // ... existing turn advancement event logic ...
  store.dispatch(compactHistory())
}
```

### 4. Update Events Slice for Turn-Based Retention

Modify [web/src/redux/slices/eventsSlice.ts](web/src/redux/slices/eventsSlice.ts):

```typescript
const MAX_EVENTS = 500
const RECENT_TURNS_TO_KEEP = 3

// Add new reducer to compact events by turn
compactEventsByTurn(state, action: PayloadAction<{ currentTurn: number }>) {
  const { currentTurn } = action.payload
  const oldTurnThreshold = currentTurn - RECENT_TURNS_TO_KEEP // N-3
  
  // Remove events from turns older than threshold
  state.events = state.events.filter(event => event.turn > oldTurnThreshold)
  
  // Also enforce overall limit
  if (state.events.length > MAX_EVENTS) {
    state.events.splice(MAX_EVENTS)
  }
}
```

### 5. Dispatch Event Compaction After Turn Advancement

Update [web/src/redux/eventsMiddleware.ts](web/src/redux/eventsMiddleware.ts) to also compact events:

```typescript
if (advanceTurn.match(action)) {
  // ... existing turn advancement event logic ...
  store.dispatch(compactHistory())
  store.dispatch(compactEventsByTurn({ currentTurn: gameState.turn }))
}
```

### 6. Update ResetControls UI

Modify [web/src/components/GameControls/ResetControls.tsx](web/src/components/GameControls/ResetControls.tsx):

**Reset/Revert Turn Button:**

- If `actionsThisTurn > 0`: Show "Reset turn" - jumps to start of current turn
- If `actionsThisTurn === 0` and previous turn exists in history: Show "Revert turn" - jumps to end of previous turn
- If `actionsThisTurn === 0` and no previous turn: Disabled

**Undo Button:**

- Disabled when `actionsThisTurn === 0` (no player actions to undo in current turn)
- User should use "Revert turn" to go back to previous turn

### 7. Add Selectors for Turn-Aware Undo State

The logic to determine if we can undo within current turn:

```typescript
const canUndoWithinTurn = actionsThisTurn > 0
const canRevertToPreviousTurn = actionsThisTurn === 0 && 
  undoable.past.some(s => s.gameState.turn < currentTurn)
```

## Data Flow on Turn Advancement

When player advances from turn N to N+1:

1. `advanceTurn` action dispatched
2. Redux-undo records state in `past` array
3. Middleware dispatches `compactHistory()`
4. Wrapper reducer compacts undo history:

   - Turns N-2 and earlier (now N-3 relative to new turn): Reduce to only the last state each
   - Turns N-1 and N (now N-2 and N-1 relative to new turn): Keep all states

5. Middleware dispatches `compactEventsByTurn({ currentTurn: N+1 })`
6. Events reducer removes events from turns N-2 and earlier (now N-3 relative to new turn)

## Example Timeline

At turn 5 (N=5):

| Turn | Undo History | Events Log |

|------|--------------|------------|

| 1 | 1 state (last only) | No events |

| 2 | 1 state (last only) | No events |

| 3 | All states | All events |

| 4 | All states | All events |

| 5 | All states | All events |

After advancing to turn 6 (N=6):

| Turn | Undo History | Events Log |

|------|--------------|------------|

| 1 | 1 state (last only) | No events |

| 2 | 1 state (last only) | No events |

| 3 | 1 state (compacted) | No events (removed) |

| 4 | All states | All events |

| 5 | All states | All events |

| 6 | All states | All events |
