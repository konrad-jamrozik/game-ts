import { configureStore, type Store } from '@reduxjs/toolkit'
import { debounce } from 'radash'
import { createRootReducer, DEFAULT_UNDO_LIMIT, type RootState } from './rootReducer'
import { eventsMiddleware } from './eventsMiddleware'
import { loadPersistedState, saveStateToDexie } from './persist'
import { assertDefined } from '../lib/primitives/assertPrimitives'

export type StoreOptions = { undoLimit?: number }

let _store: Store<RootState> | undefined

// Must be called before getStore(). Call once at app startup.
export async function initStore(options?: StoreOptions): Promise<void> {
  if (_store) {
    throw new Error('Store already initialized')
  }

  const undoLimit = options?.undoLimit ?? DEFAULT_UNDO_LIMIT
  const rootReducer = createRootReducer(undoLimit)
  const maybePersistedState: RootState | undefined = await loadPersistedState()

  // KJA1 fix
  // eslint-disable-next-line require-atomic-updates -- Safe: initStore is called once at startup
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

export function getStore(): Store<RootState> {
  assertDefined(_store, 'Store not initialized. Call initStore() first.')
  return _store
}

export type AppDispatch = Store<RootState>['dispatch']
