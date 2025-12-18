# About state initialization

- [About state initialization](#about-state-initialization)
- [How the initial state is built](#how-the-initial-state-is-built)
- [How the game state is accessed from components](#how-the-game-state-is-accessed-from-components)
- [How the game state is reset](#how-the-game-state-is-reset)
  - [Reset with a custom initial state](#reset-with-a-custom-initial-state)
  - [Reset with a debug initial state](#reset-with-a-debug-initial-state)
- [See also](#see-also)

This document explains how the game state is initialized and reset.

# How the initial state is built

The initial state is built using the `bldInitialState` function from `web/src/lib/factories/gameStateFactory.ts`.
It is called directly in the game state slice in `web/src/redux/slices/gameStateSlice.ts` to set the initial state:

```typescript 31:34:web/src/redux/slices/gameStateSlice.ts
const gameStateSlice = createSlice({
  name: 'gameState',
  initialState: bldInitialState(),
  reducers: {
```

It then becomes part of the game's root reducer in `web/src/redux/rootReducer.ts`:

```typescript 13:15:web/src/redux/rootReducer.ts
const combinedReducer = combineReducers({
  gameState: gameStateReducer,
})
```

It is wrapped in `undoable` reducer, and then added to the final `rootReducer` in `web/src/redux/rootReducer.ts`:

```typescript 36:42:web/src/redux/rootReducer.ts
export const rootReducer = combineReducers({
  undoable: undoableReducer,
  events: eventsReducer, // Events are not wrapped in undoable
  settings: settingsReducer, // Settings are not wrapped in undoable
  selection: selectionReducer, // Selection state is not wrapped in undoable
  expansion: expansionReducer, // Expansion state is not wrapped in undoable
})
```

This is then used in `web/src/redux/store.ts` to create the store:

```typescript 9:13:web/src/redux/store.ts
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(eventsMiddleware()),
  ...(maybePersistedState ? { preloadedState: maybePersistedState } : {}),
})
```

And the `store` is injected into the `App` component in `web/src/main.tsx`:

```typescript 34:36:web/src/main.tsx
            <Provider store={store}>
              <App />
            </Provider>
```

# How the game state is accessed from components

Any component like `GameControls.tsx` can access the game state using the `useAppSelector` hook:

```typescript
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
const gameState = useAppSelector((state) => state.undoable.present.gameState)
```

The hook itself is defined in `web/src/redux/hooks.ts`:

```typescript 14:15:web/src/redux/hooks.ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

where `RootState` is defined in `web/src/redux/rootReducer.ts`:

```typescript 44:44:web/src/redux/rootReducer.ts
export type RootState = ReturnType<typeof rootReducer>
```

# How the game state is reset

The game state can be reset using the `reset` action. From `ResetControls` component, it can be done like this:

```typescript 49:54:web/src/components/GameControls/ResetControls.tsx
  function handleResetGame(event?: React.MouseEvent<HTMLButtonElement>): void {
    const useDebug = Boolean(event && (event.ctrlKey || event.metaKey))
    dispatch(reset(useDebug ? { debug: true } : undefined))
    dispatch(clearAllSelection())
    dispatch(ActionCreators.clearHistory())
  }
```

The `reset` action is defined in `web/src/redux/reducers/gameControlsReducers.ts`, as follows:

```typescript 11:17:web/src/redux/reducers/gameControlsReducers.ts
export function reset(
  state: GameState,
  action: PayloadAction<{ debug?: boolean; customState?: GameState } | undefined>,
): void {
  const stateAfterReset = action.payload?.customState ?? bldInitialState({ debug: action.payload?.debug === true })
  Object.assign(state, stateAfterReset)
}
```

The `bldInitialState` function is defined and exported from `web/src/lib/factories/gameStateFactory.ts`.

## Reset with a custom initial state

For tests, if you need custom initial state, you can use the `reset` action with the `customState` option,
e.g. from `App.test.tsx`:

```typescript 81:83:web/test/e2e/App.test.tsx
  const debugState = bldInitialState({ debug: true })
  store.dispatch(reset({ customState: { ...debugState, money: 200 } }))
  store.dispatch(clearEvents()) // Clear the reset event
```

## Reset with a debug initial state

If you pass `debug: true` to the `bldInitialState` function, it will return a debug initial state.

It is done like that, in the `bldInitialState` function in `web/src/lib/factories/gameStateFactory.ts`:

```typescript 59:64:web/src/lib/factories/gameStateFactory.ts
  let gameState: GameState = normalGameState
  if (useDebug) {
    const debugOverrides = bldDebugInitialOverrides()
    gameState = { ...gameState, ...debugOverrides }
    gameState = overwriteWithDebugOverrides(gameState)
  }
```  

# See also

- [About top-level app initialization](about_top_level_app_init.md)
- [About code dependencies](about_code_dependencies.md)
