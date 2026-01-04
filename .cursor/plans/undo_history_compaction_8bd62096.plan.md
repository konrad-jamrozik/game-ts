---
name: undo history compaction
overview: Implement turn-based history compaction that keeps only the last state from previous turns while preserving all player actions in the current turn (up to 200). Also update the Reset/Revert turn button and Undo button behavior.
todos:
  - id: create-compaction
    content: Create historyCompaction.ts with action type and compaction logic function
    status: pending
  - id: wrap-reducer
    content: Wrap undoable reducer in rootReducer.ts to handle COMPACT_HISTORY action
    status: pending
  - id: dispatch-compaction
    content: Update eventsMiddleware.ts to dispatch compactHistory() after advanceTurn
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

- `past`: Array of previous states (up to 500 entries)
- `present`: Current state  
- `future`: States that were undone

States are recorded on:

- Player actions (via `isPlayerAction` filter)
- Turn advancement (via `advanceTurn.match` filter)

## Key Changes

### 1. Create History Compaction Logic

Create new file [web/src/redux/historyCompaction.ts](web/src/redux/historyCompaction.ts):

```typescript
// Action type for compacting history after turn advancement
export const COMPACT_HISTORY = 'undoable/COMPACT_HISTORY'
export const compactHistory = () => ({ type: COMPACT_HISTORY })
```

This will define the compaction logic:

- For each past turn (turn < currentTurn), keep only the **last state** (highest actionsCount for that turn)
- For the current turn, keep all states up to limit (200)
- The "last state of a turn" is the one just before turn advanced (has the turn's final actionsCount)

### 2. Create Custom Wrapper Reducer

Modify [web/src/redux/rootReducer.ts](web/src/redux/rootReducer.ts) to wrap the undoable reducer:

```typescript
const CURRENT_TURN_UNDO_LIMIT = 200

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

The `compactHistoryState` function will:

1. Group past states by turn number
2. For each turn before current: keep only the entry with highest actionsCount
3. For current turn: keep all entries (respecting limit)
4. Return modified state with compacted `past` array

### 3. Dispatch Compaction After Turn Advancement

Modify [web/src/redux/eventsMiddleware.ts](web/src/redux/eventsMiddleware.ts) to dispatch `compactHistory()` after `advanceTurn`:

```typescript
if (advanceTurn.match(action)) {
  // ... existing turn advancement event logic ...
  store.dispatch(compactHistory())
}
```

### 4. Update ResetControls UI

Modify [web/src/components/GameControls/ResetControls.tsx](web/src/components/GameControls/ResetControls.tsx):

**Reset/Revert Turn Button:**

- If `actionsThisTurn > 0`: Show "Reset turn" - jumps to start of current turn
- If `actionsThisTurn === 0` and previous turn exists in history: Show "Revert turn" - jumps to end of previous turn
- If `actionsThisTurn === 0` and no previous turn: Disabled

**Undo Button:**

- Disabled when `actionsThisTurn === 0` (no player actions to undo in current turn)
- User should use "Revert turn" to go back to previous turn

### 5. Add Selectors for Turn-Aware Undo State

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
4. Wrapper reducer compacts:

   - Turn N-2 and earlier: Already compacted (one state each)
   - Turn N-1: Reduce to only the last state (before advancing to N)
   - Turn N: Keep all states (will be compacted when advancing to N+2)
