# Dependency violations

This document lists violations of the dependency rules defined in [about_code_dependencies.md](about_code_dependencies.md).

## Violations

### 1. `main.tsx` imports from `components/Error/ErrorBoundary`

**File**: `web/src/main.tsx`  
**Violation**: Imports `./components/Error/ErrorBoundary`

**Expected**: According to the diagram, `main.tsx` should only import `components/App.tsx` and `redux/store.ts`.

**Fix**: Move the `ErrorBoundary` import to `components/App.tsx` or restructure so `main.tsx` only imports from allowed locations.

---

### 2. `main.tsx` imports from `components/styling/theme`

**File**: `web/src/main.tsx`  
**Violation**: Imports `./components/styling/theme`

**Expected**: According to the diagram, `main.tsx` should only import `components/App.tsx` and `redux/store.ts`.

**Fix**: Move the `theme` import to `components/App.tsx` or restructure so `main.tsx` only imports from allowed locations.

---

### 3. `redux/store.ts` imports from `redux/slices/*`

**File**: `web/src/redux/store.ts`  
**Violation**: Imports `./slices/eventsSlice`, `./slices/gameStateSlice`, `./slices/selectionSlice`, `./slices/settingsSlice`

**Expected**: According to the diagram, `redux/store.ts` → `redux/eventsMiddleware.ts` → `redux/reducers` → `redux/slices`. So `redux/store.ts` should not directly import slices.

**Fix**: Import slices through reducers instead of directly.

---

### 4. `redux/store.ts` imports from `redux/reducers/asPlayerAction`

**File**: `web/src/redux/store.ts`  
**Violation**: Imports `./reducers/asPlayerAction`

**Expected**: According to the diagram, `redux/store.ts` → `redux/eventsMiddleware.ts` → `redux/reducers`. So `redux/store.ts` should not directly import reducers.

**Fix**: Import `asPlayerAction` through `redux/eventsMiddleware.ts` instead of directly.

---

### 5. `redux/store.ts` and `redux/persist.ts` circular dependency

**File**: `web/src/redux/store.ts` and `web/src/redux/persist.ts`  
**Violation**: `redux/store.ts` imports `./persist`, and `redux/persist.ts` imports `./store` (for `RootState` type)

**Expected**: No import cycles are allowed.

**Fix**: Extract `RootState` type to a separate file that both can import, or restructure to avoid the cycle.

---

### 6. `redux/eventsMiddleware.ts` imports from `redux/slices/*`

**File**: `web/src/redux/eventsMiddleware.ts`  
**Violation**: Imports `./slices/eventsSlice`, `./slices/gameStateSlice`

**Expected**: According to the diagram, `redux/eventsMiddleware.ts` → `redux/reducers` → `redux/slices`. So `redux/eventsMiddleware.ts` should not directly import slices.

**Fix**: Import slices through reducers instead of directly.

---

### 7. `redux/eventsMiddleware.ts` imports from `lib/collections/missions`

**File**: `web/src/redux/eventsMiddleware.ts`  
**Violation**: Imports `../lib/collections/missions`

**Expected**: According to the diagram, `redux/eventsMiddleware.ts` → `redux/reducers` → `redux/slices` → `lib/game_utils` → `lib/ruleset` → `lib/model_utils` → `lib/collections`. So `redux/eventsMiddleware.ts` should not directly import from `lib/collections`.

**Fix**: Access collections through the proper dependency chain (e.g., through reducers or slices).

---

### 8. `redux/eventsMiddleware.ts` imports from `lib/model_utils/formatModelUtils`

**File**: `web/src/redux/eventsMiddleware.ts`  
**Violation**: Imports `../lib/model_utils/formatModelUtils`

**Expected**: According to the diagram, `redux/eventsMiddleware.ts` → `redux/reducers` → `redux/slices` → `lib/game_utils` → `lib/ruleset` → `lib/model_utils`. So `redux/eventsMiddleware.ts` should not directly import from `lib/model_utils`.

**Fix**: Access model utils through the proper dependency chain.

---

### 9. `redux/eventsMiddleware.ts` imports from `lib/primitives/assertPrimitives`

**File**: `web/src/redux/eventsMiddleware.ts`  
**Violation**: Imports `../lib/primitives/assertPrimitives`

**Expected**: According to the diagram, `redux/eventsMiddleware.ts` → `redux/reducers` → `redux/slices` → `lib/game_utils` → `lib/ruleset` → `lib/model_utils` → `lib/collections` → `lib/model` → `lib/utils` → `lib/primitives`. So `redux/eventsMiddleware.ts` should not directly import from `lib/primitives`.

**Fix**: Access primitives through the proper dependency chain.

---

### 10. `redux/reducers/*` import directly from `lib/*` directories

**Files**: All files in `web/src/redux/reducers/`  
**Violation**: Reducers import directly from various `lib/*` directories:
- `lib/model/*`
- `lib/ruleset/*`
- `lib/utils/*`
- `lib/primitives/*`
- `lib/model_utils/*`
- `lib/collections/*`

**Expected**: According to the diagram, `redux/reducers` → `redux/slices` → `lib/game_utils` → `lib/ruleset` → `lib/model_utils` → `lib/collections` → `lib/model` → `lib/utils` → `lib/primitives`. So reducers should not directly import from `lib/*` directories.

**Fix**: Reducers should access `lib/*` code through slices, not directly.

---

### 11. `redux/slices/gameStateSlice.ts` imports from `lib/ruleset/initialState`

**File**: `web/src/redux/slices/gameStateSlice.ts`  
**Violation**: Imports `../../lib/ruleset/initialState`

**Expected**: According to the diagram, `redux/slices` → `lib/game_utils` → `lib/ruleset`. So slices should not directly import from `lib/ruleset`.

**Fix**: Access `lib/ruleset` through `lib/game_utils` instead of directly.

---

### 12. `redux/slices/gameStateSlice.ts` imports from `redux/reducers/*` (circular dependency)

**File**: `web/src/redux/slices/gameStateSlice.ts`  
**Violation**: Imports from `../reducers/agentReducers`, `../reducers/leadReducers`, `../reducers/missionReducers`, `../reducers/upgradeReducers`, `../reducers/gameControlsReducers`, `../reducers/debugReducers`

**Expected**: According to the diagram, `redux/reducers` → `redux/slices`. So slices should not import reducers (this creates a cycle).

**Fix**: Restructure to break the circular dependency. Reducers should call slice logic, not the other way around.

---

### 13. `redux/selectors/selectors.ts` imports from `lib/model/agentModel`

**File**: `web/src/redux/selectors/selectors.ts`  
**Violation**: Imports `../../lib/model/agentModel`

**Expected**: According to the diagram, `redux/selectors` → `redux/store.ts`. So selectors should not directly import from `lib/model`.

**Fix**: Access model types through the store state or through the proper dependency chain.
