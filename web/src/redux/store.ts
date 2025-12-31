import { configureStore, type Store } from '@reduxjs/toolkit'
import { debounce } from 'radash'
import { createRootReducer, DEFAULT_UNDO_LIMIT, type RootState } from './rootReducer'
import { eventsMiddleware } from './eventsMiddleware'
import { loadPersistedState, saveStateToDexie } from './persist'
import { assertDefined } from '../lib/primitives/assertPrimitives'

export type StoreOptions = { undoLimit?: number }

let _store: Store<RootState> | undefined

// Optional: call before getStore() to configure with custom options
export async function initStore(options?: StoreOptions): Promise<void> {
  if (_store) {
    throw new Error('Store already initialized')
  }

  const undoLimit = options?.undoLimit ?? DEFAULT_UNDO_LIMIT
  const rootReducer = createRootReducer(undoLimit)
  const maybePersistedState: RootState | undefined = await loadPersistedState()

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

// Lazily initializes store with defaults on first call
export async function getStore(): Promise<Store<RootState>> {
  if (!_store) {
    await initStore()
  }
  assertDefined(_store)
  return _store
}

export type AppDispatch = Store<RootState>['dispatch']
