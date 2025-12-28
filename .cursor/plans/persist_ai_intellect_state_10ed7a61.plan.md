---
name: Persist AI Intellect State
overview: ""
todos:
  - id: create-slice
    content: Create aiStateSlice.ts with BasicIntellectState type and reducers
    status: completed
  - id: add-to-undoable
    content: Add aiStateReducer to combinedReducer in rootReducer.ts
    status: completed
    dependencies:
      - create-slice
  - id: refactor-intellect
    content: Refactor basicIntellect.ts to use Redux state and dispatch actions
    status: completed
    dependencies:
      - add-to-undoable
  - id: update-integrations
    content: Update delegateTurnToAIPlayer, ResetControls, and appInitChecks
    status: completed
    dependencies:
      - refactor-intellect
  - id: bump-version
    content: Increment STATE_VERSION in persist.ts
    status: completed
    dependencies:
      - add-to-undoable
---

# Persist basicIntellectState in Redux (undoable)

## Overview

Move `basicIntellectState` from a module-level variable into Redux state within the undoable wrapper, so it persists to IndexedDB and correctly reverts on undo/redo.

## Architecture

```mermaid
flowchart TB
    subgraph undoable [Undoable State]
        gameState[gameState]
        aiState[aiState NEW]
    end
    subgraph nonUndoable [Non-Undoable State]
        events[events]
        settings[settings]
        selection[selection]
        expansion[expansion]
    end
    undoable --> IndexedDB
    nonUndoable --> IndexedDB
```



## Implementation

### 1. Create new AI state slice

Create [`web/src/redux/slices/aiStateSlice.ts`](web/src/redux/slices/aiStateSlice.ts) with:

- `BasicIntellectState` type (moved from `basicIntellect.ts`)
- Initial state using `createInitialState()` logic
- Reducers for updating desired/actual counts
- Export selectors

### 2. Add to undoable reducer

In [`web/src/redux/rootReducer.ts`](web/src/redux/rootReducer.ts):

- Import `aiStateReducer`
- Add to `combinedReducer` alongside `gameState`

### 3. Refactor basicIntellect.ts

In [`web/src/ai/intellects/basicIntellect.ts`](web/src/ai/intellects/basicIntellect.ts):

- Remove module-level `basicIntellectState` variable
- Remove `BasicIntellectState` type (now in slice)
- Update `playTurn` to accept/use state from Redux
- Update all mutations to dispatch Redux actions instead of direct mutation
- Remove `resetBasicIntellectState()` export (reset handled by Redux slice)

### 4. Update integration points

- [`web/src/ai/delegateTurnToAIPlayer.ts`](web/src/ai/delegateTurnToAIPlayer.ts): Pass AI state to intellect
- [`web/src/components/GameControls/ResetControls.tsx`](web/src/components/GameControls/ResetControls.tsx): Remove `resetBasicIntellectState()` call (Redux reset handles it)
- [`web/src/components/utils/appInitChecks.ts`](web/src/components/utils/appInitChecks.ts): Remove `resetBasicIntellectState()` call

### 5. Bump state version

In [`web/src/redux/persist.ts`](web/src/redux/persist.ts):

- Increment `STATE_VERSION` to invalidate old persisted state without new `aiState`

## Key Design Decisions