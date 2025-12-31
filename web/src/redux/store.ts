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

  // Create store in local variable first to avoid async race condition
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(eventsMiddleware()),
    ...(maybePersistedState ? { preloadedState: maybePersistedState } : {}),
  })

  // Guard against concurrent calls: another (earlier) initStore() call could have completed
  // during the await above and set _store. TypeScript's control flow analysis
  // doesn't track mutations across await boundaries, so it incorrectly narrows
  // _store to always be undefined here.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (_store !== undefined) {
    throw new Error('Store already initialized')
  }
  _store = store

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
