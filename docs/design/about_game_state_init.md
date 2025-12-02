# About state initialization

This document explains how the game state is initialized and reset.

# How the initial state is built

The initial state is built in `web/src/lib/ruleset/initialState.ts` using the `makeInitialState` function:

``` typescript  
const initialState: GameState = makeInitialState()
```

Is is then used by game state slice in `web/src/redux/slices/gameStateSlice.ts` to set the initial state:

``` typescript
const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
```

It then becomes part of the game's root reducer in `web/src/redux/rootReducer.ts`:

``` typescript
const combinedReducer = combineReducers({
  gameState: gameStateReducer,
})
```

It is wrapped in `undoable` reducer, and then added to the final `rootReducer.

This is then used in `web/src/redux/store.ts` to create the store:

``` typescript
export const store = configureStore({
  reducer: rootReducer,
})
```

And the `store` is injected into the `App` component in `web/src/redux/App.tsx`:

``` typescript
<Provider store={store}>
  <App />
</Provider>
```

# How the game state is accessed from the components

Any component like `GameControls` can access the game state using the `useAppSelector` hook:

``` typescript
const gameState = useAppSelector((state) => state.undoable.present.gameState)
```

The hook itself is defined in `web/src/redux/hooks.ts`:

``` typescript
export const useAppSelector = useSelector.withTypes<RootState>()
```

where `RootState` is defined in `web/src/redux/rootReducer.ts`:

``` typescript
type RootState = ReturnType<typeof rootReducer>
```

# How the game state is reset

The game state can be reset using the `reset` action. From `GameControls` component, it can be done like this:

``` typescript
  function handleResetGame(event?: React.MouseEvent<HTMLButtonElement>): void {
    const useDebug = Boolean(event && (event.ctrlKey || event.metaKey))
    dispatch(reset(useDebug ? { debug: true } : undefined))
    dispatch(clearAllSelection())
    dispatch(ActionCreators.clearHistory())
  }
```

For tests, if you need custom initial state, you can use the `reset` action with the `customState` option,
e.g. from `App.test.tsx`:

``` typescript
  const debugState = makeInitialState({ debug: true })
  store.dispatch(reset({ customState: { ...debugState, money: 200 } }))
  store.dispatch(clearEvents()) // Clear the reset event
```

The `makeInitialState` function is defined in `web/src/lib/ruleset/initialState.ts`.

If you pass `debug: true` to the `makeInitialState` function, it will return a debug initial state.

It is done like that, in the `makeInitialState` function:

``` typescript
  if (useDebug) {
    const debugOverrides = makeDebugInitialOverrides()
    gameState = { ...gameState, ...debugOverrides }
  }
```  

The `reset` action is defined in `web/src/redux/reducers/gameControlsReducers.ts`, as follows:

``` typescript
export function reset(
  state: GameState,
  action: PayloadAction<{ debug?: boolean; customState?: GameState } | undefined>,
): void {
  const stateAfterReset = action.payload?.customState ?? makeInitialState({ debug: action.payload?.debug === true })
  Object.assign(state, stateAfterReset)
}
```

# See also

- [About top-level app initialization](about_top_level_app_init.md)
- [About code dependencies](about_code_dependencies.md)
