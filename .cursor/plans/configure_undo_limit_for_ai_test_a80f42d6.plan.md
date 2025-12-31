---
name: Configure undo limit for AI test
overview: ""
todos:
  - id: refactor-rootReducer
    content: Refactor rootReducer.ts to export createRootReducer factory function
    status: completed
  - id: refactor-store
    content: Refactor store.ts to wrap init logic in initStore() function
    status: completed
    dependencies:
      - refactor-rootReducer
  - id: update-imports
    content: Update files importing store to use getStore() pattern
    status: completed
    dependencies:
      - refactor-store
  - id: update-test
    content: "Update AI test to call initStore({ undoLimit: 0 })"
    status: completed
    dependencies:
      - update-imports
---

# Configure Undo Limit for AI Test

Make the Redux undo limit configurable so the AI test can run with `UNDO_LIMIT = 0` to avoid storing 500 snapshots during 100 turns.

## Overview

Wrap the store initialization logic in a function with lazy initialization. `getStore()` lazily initializes with defaults on first call. Tests can optionally call `initStore({ undoLimit: 0 })` before `getStore()` to configure it.

## Implementation

### 1. Refactor `rootReducer.ts`

Create a factory function `createRootReducer(undoLimit: number)` that builds the root reducer:

```typescript
// web/src/redux/rootReducer.ts

export const DEFAULT_UNDO_LIMIT = 500

export function createRootReducer(undoLimit: number = DEFAULT_UNDO_LIMIT) {
  const combinedReducer = combineReducers({ gameState: gameStateReducer, aiState: aiStateReducer })
  const undoableReducer = undoable(combinedReducer, { limit: undoLimit + 1, filter: ... })
  return combineReducers({ undoable: undoableReducer, events: eventsReducer, ... })
}
```

### 2. Refactor `store.ts`

Wrap the store initialization with lazy `getStore()`:

```typescript
// web/src/redux/store.ts

export type StoreOptions = { undoLimit?: number }

let _store: Store<RootState> | undefined

// Optional: call before getStore() to configure with custom options
export async function initStore(options?: StoreOptions): Promise<void> {
  if (_store) throw new Error('Store already initialized')
  const rootReducer = createRootReducer(options?.undoLimit ?? DEFAULT_UNDO_LIMIT)
  const maybePersistedState = await loadPersistedState()
  _store = configureStore({ reducer: rootReducer, ... })
  // ... rest of init logic (events, persistence subscription)
}

// Lazily initializes store with defaults on first call
export async function getStore(): Promise<Store<RootState>> {
  if (!_store) {
    await initStore()
  }
  return _store
}
```

### 3. Update all files importing `store`

Replace `store` import with `await getStore()`. Key files:

- [`web/src/ai/delegateTurnToAIPlayer.ts`](web/src/ai/delegateTurnToAIPlayer.ts)
- [`web/src/redux/playTurnApi.ts`](web/src/redux/playTurnApi.ts)
- [`web/src/redux/hooks.ts`](web/src/redux/hooks.ts)
- Test fixtures and utilities

### 4. Update AI test file

Call `initStore({ undoLimit: 0 })` before any `getStore()` calls:

```typescript
// web/test/ai/basicIntellect.test.ts
import { initStore, getStore } from '../../src/redux/store'

beforeAll(async () => {
  await initStore({ undoLimit: 0 })
})

// Use await getStore() instead of store
```
