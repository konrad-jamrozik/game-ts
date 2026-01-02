import { configureStore, type Store } from '@reduxjs/toolkit'
import { debounce } from 'radash'
import { assertDefined } from '../lib/primitives/assertPrimitives'
import { eventsMiddleware } from './eventsMiddleware'
import { initPersistence, loadPersistedState, saveStateToDexie } from './persist'
import { createRootReducer, DEFAULT_UNDO_LIMIT, type RootReducerState } from './rootReducer'

export type StoreOptions = {
  undoLimit?: number
  /** Set to false to disable IndexedDB persistence (useful for tests). Defaults to true. */
  enablePersistence?: boolean
}

type DebouncedSaveFunction = ReturnType<typeof debounce<[]>>

export type AppStore = Store<RootReducerState>
let _store: AppStore | undefined
let _initStoreCalled = false
let _debouncedSave: DebouncedSaveFunction | undefined

// Must be called before getStore(). Call once at app startup.
export async function initStore(options?: StoreOptions): Promise<void> {
  if (_initStoreCalled) {
    throw new Error('initStore must be called only once')
  }
  _initStoreCalled = true

  const undoLimit = options?.undoLimit ?? DEFAULT_UNDO_LIMIT
  const enablePersistence = options?.enablePersistence ?? true
  const rootReducer = createRootReducer(undoLimit)

  // Initialize persistence (creates Dexie instance) before loading state.
  // This ensures fake-indexeddb is available in tests before Dexie is created.
  let maybePersistedState: RootReducerState | undefined
  if (enablePersistence) {
    initPersistence()
    maybePersistedState = await loadPersistedState()
  }

  _store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
        actionCreatorCheck: false,
      }).prepend(eventsMiddleware()),
    ...(maybePersistedState ? { preloadedState: maybePersistedState } : {}),
  })

  // If no persisted state was loaded, add a "New game started" event
  if (!maybePersistedState) {
    // Import addEvent dynamically to avoid circular dependency
    const { addTextEvent: addEvent } = await import('./slices/eventsSlice')
    const state = _store.getState()
    const { gameState } = state.undoable.present

    _store.dispatch(
      addEvent({
        message: 'New game started',
        turn: gameState.turn,
        actionsCount: gameState.actionsCount,
      }),
    )
  }

  // Only set up persistence subscription if enabled
  if (enablePersistence) {
    _debouncedSave = debounce({ delay: 300 }, async () => {
      if (_store) {
        await saveStateToDexie(_store.getState())
      }
    })

    _store.subscribe(() => {
      _debouncedSave?.()
    })
  }
}

export function getStore(): AppStore {
  assertDefined(_store, 'Store not initialized. Call initStore() first.')
  return _store
}

/** Flush any pending debounced saves immediately. Useful in tests. */
export function flushPendingSave(): void {
  if (_debouncedSave?.isPending() === true) {
    _debouncedSave.flush()
  }
}

/** Cancel any pending debounced saves. Useful in tests to prevent saves after test cleanup. */
export function cancelPendingSave(): void {
  _debouncedSave?.cancel()
}

export type AppDispatch = AppStore['dispatch']
