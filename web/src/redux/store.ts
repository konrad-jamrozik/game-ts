import { configureStore, type Store } from '@reduxjs/toolkit'
import { debounce } from 'radash'
import { createRootReducer, DEFAULT_UNDO_LIMIT, type RootReducerState } from './rootReducer'
import { eventsMiddleware } from './eventsMiddleware'
import { loadPersistedState, saveStateToDexie } from './persist'
import { assertDefined } from '../lib/primitives/assertPrimitives'

export type StoreOptions = { undoLimit?: number }

let _store: Store<RootReducerState> | undefined
let _initStoreCalled = false

// Must be called before getStore(). Call once at app startup.
export async function initStore(options?: StoreOptions): Promise<void> {
  if (_initStoreCalled) {
    throw new Error('initStore must be called only once')
  }
  _initStoreCalled = true

  const undoLimit = options?.undoLimit ?? DEFAULT_UNDO_LIMIT
  const rootReducer = createRootReducer(undoLimit)
  const maybePersistedState: RootReducerState | undefined = await loadPersistedState()

  _store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(eventsMiddleware()),
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

  const debouncedSave = debounce({ delay: 300 }, async () => {
    if (_store) {
      await saveStateToDexie(_store.getState())
    }
  })

  _store.subscribe(() => {
    debouncedSave()
  })
}

export function getStore(): Store<RootReducerState> {
  assertDefined(_store, 'Store not initialized. Call initStore() first.')
  return _store
}

export type AppDispatch = Store<RootReducerState>['dispatch']
