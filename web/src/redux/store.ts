import { configureStore, type Store } from '@reduxjs/toolkit'
import { debounce } from 'radash'
import { assertDefined } from '../lib/primitives/assertPrimitives'
import { eventsMiddleware } from './eventsMiddleware'
import { initPersistence, loadPersistedState, saveStateToDexie } from './persist'
import { createRootReducer, DEFAULT_UNDO_LIMIT, type RootReducerState } from './rootReducer'
import { addTextEvent } from './slices/eventsSlice'

export type StoreOptions = {
  undoLimit?: number
  /** Set to false to disable IndexedDB persistence (useful for tests). Defaults to true. */
  enablePersistence?: boolean
  /** Enable Redux default middleware checks. Defaults to true. */
  enableDefaultMiddleware?: boolean
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
  const enableDefaultMiddleware = options?.enableDefaultMiddleware ?? true
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
        // Default middleware causes significant performance hit. See about_profiling.md
        // It is also forcefully disabled by RTK when running in prod, it has a check like:
        //   if (process.env.NODE_ENV !== 'production')
        //      ...try enable if set...
        // so "vite preview" will result in these being false.
        //
        // immutableCheck: checks for accidental mutation of redux state outside of
        // reducers or better dispatches, but I use immer which auto-freezes state.
        // So this will mostly just give better error messages.
        // The 'undoable' path is excluded because deep-scanning the undo history
        // (up to DEFAULT_UNDO_LIMIT snapshots, each with the full game state) is what
        // causes the multi-second dispatch slowdown. See about_profiling.md.
        immutableCheck: enableDefaultMiddleware ? { ignoredPaths: ['undoable'] } : false,
        // serializableCheck: checks for non-serializable values
        // (Dates, Maps, Sets, class instances, functions, Promises) in state or actions.
        // Preventing the persistence Dexie instance from getting junk into it.
        // The 'undoable' path is excluded for the same performance reason as immutableCheck.
        serializableCheck: enableDefaultMiddleware ? { ignoredPaths: ['undoable'] } : false,
        // actionCreatorCheck:  It catches a narrow mistake: dispatching an action creator function
        // itself instead of calling it — dispatch(setViewAgents) instead of dispatch(setViewAgents()).
        // No performance hit.
        actionCreatorCheck: enableDefaultMiddleware,
      }).prepend(eventsMiddleware()),
    ...(maybePersistedState ? { preloadedState: maybePersistedState } : {}),
  })

  // If no persisted state was loaded, add a "New game started" event
  if (!maybePersistedState) {
    const state = _store.getState()
    const { gameState } = state.undoable.present

    _store.dispatch(
      addTextEvent({
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
