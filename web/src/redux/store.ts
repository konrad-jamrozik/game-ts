import { configureStore } from '@reduxjs/toolkit'
import { debounce } from 'radash'
import { rootReducer, type RootState } from './rootReducer'
import { eventsMiddleware } from './eventsMiddleware'
import { loadPersistedState, saveStateToDexie } from './persist'

const maybePersistedState: RootState | undefined = await loadPersistedState()

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(eventsMiddleware()),
  ...(maybePersistedState ? { preloadedState: maybePersistedState } : {}),
})

// If no persisted state was loaded, add a "New game started" event
if (!maybePersistedState) {
  // Import addEvent dynamically to avoid circular dependency
  const { addTextEvent: addEvent } = await import('./slices/eventsSlice')
  const state = store.getState()
  const { gameState } = state.undoable.present

  store.dispatch(
    addEvent({
      message: 'New game started',
      turn: gameState.turn,
      actionsCount: gameState.actionsCount,
    }),
  )
}

const debouncedSave = debounce({ delay: 300 }, async () => {
  await saveStateToDexie(store.getState())
})

store.subscribe(() => {
  debouncedSave()
})

// RootState is now defined in rootReducer.ts to break the circular dependency between store.ts and persist.ts

export type AppDispatch = typeof store.dispatch
