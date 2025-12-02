<!-- 423c1aa3-8d04-44fd-ac82-bfaba8ae5488 bf9e8c6b-7502-4339-b61f-e38a2708d1ac -->
# Unity Conversion Plan

## Overview

Convert the React-based web game to Unity desktop application (Windows/Mac/Linux). The conversion will replicate the existing 2D UI using Unity's uGUI system, rewrite all game logic in C#, and maintain feature parity with the current web version.

## Architecture Overview

**Current Stack:**

- React + TypeScript + MUI for UI
- Redux Toolkit for state management
- IndexedDB (Dexie.js) for persistence
- Vite for building

**Target Stack:**

- Unity 2022.3 LTS or newer
- C# for game logic
- Unity uGUI for 2D UI replication
- JSON file-based persistence (or Unity's PlayerPrefs for simple data)
- Unity's built-in build system

## Implementation Steps

### Phase 1: Unity Project Setup

1. **Create Unity Project**

- Initialize new Unity project (2D template)
- Configure project settings for desktop builds (Windows/Mac/Linux)
- Set up folder structure mirroring current `lib/` organization:
- `Assets/Scripts/Model/` - Game state types
- `Assets/Scripts/GameUtils/` - Game logic
- `Assets/Scripts/Ruleset/` - Game rules and constants
- `Assets/Scripts/Primitives/` - Core primitives (Fixed6, etc.)
- `Assets/Scripts/Collections/` - Reference data (factions, missions, etc.)
- `Assets/Scripts/UI/` - UI controllers and views
- `Assets/Scripts/Persistence/` - Save/load system

2. **Set Up C# Project Structure**

- Create namespaces matching directory structure
- Configure Assembly Definitions for better compilation performance
- Set up code style rules (similar to TypeScript conventions)

### Phase 2: Port Core Primitives and Models

1. **Port Primitives** (`web/src/lib/primitives/` → `Assets/Scripts/Primitives/`)

- Port `Fixed6` type system from TypeScript to C# (struct-based implementation)
- Port math primitives (`mathPrimitives.ts` → C# extension methods)
- Port formatting utilities (`formatPrimitives.ts` → C# string formatting)
- Port assertion utilities (`assertPrimitives.ts` → C# Debug.Assert)
- Port random utilities (`rand.ts` → Unity's Random or System.Random)

2. **Port Model Types** (`web/src/lib/model/` → `Assets/Scripts/Model/`)

- Convert TypeScript types to C# classes/structs:
- `GameState` → `GameState` class
- `Agent` → `Agent` class
- `Faction`, `LeadInvestigation`, `MissionSite` → respective classes
- `TurnReport` → `TurnReport` class
- Use C# properties instead of TypeScript object properties
- Implement `IEquatable<T>` where needed for value comparisons

3. **Port Collections** (`web/src/lib/collections/` → `Assets/Scripts/Collections/`)

- Convert reference data arrays to C# static classes or ScriptableObjects
- Port `factions.ts`, `missions.ts`, `leads.ts`, `enemyUnits.ts`, `upgrades.ts`

### Phase 3: Port Game Logic

1. **Port Ruleset** (`web/src/lib/ruleset/` → `Assets/Scripts/Ruleset/`)

- Port all constants (`constants.ts`)
- Port initial state creation (`initialState.ts` → `InitialState.cs`)
- Port all ruleset files:
- `moneyRuleset.ts` → `MoneyRuleset.cs`
- `panicRuleset.ts` → `PanicRuleset.cs`
- `skillRuleset.ts` → `SkillRuleset.cs`
- `leadRuleset.ts` → `LeadRuleset.cs`
- `missionRuleset.ts` → `MissionRuleset.cs`
- `enemyRuleset.ts` → `EnemyRuleset.cs`
- `weaponRuleset.ts` → `WeaponRuleset.cs`
- `intelRuleset.ts` → `IntelRuleset.cs`
- `recoveryRuleset.ts` → `RecoveryRuleset.cs`

2. **Port Game Utils** (`web/src/lib/game_utils/` → `Assets/Scripts/GameUtils/`)

- Port turn advancement logic:
- `evaluateTurn.ts` → `TurnEvaluator.cs`
- `evaluateBattle.ts` → `BattleEvaluator.cs`
- `evaluateDeployedMissionSite.ts` → `MissionSiteEvaluator.cs`
- `evaluateAttack.ts` → `AttackEvaluator.cs`
- `updateAgents.ts` → `AgentUpdater.cs`
- `updateLeadInvestigations.ts` → `LeadInvestigationUpdater.cs`
- `selectTarget.ts` → `TargetSelector.cs`
- Convert functional style to C# OOP style where appropriate

3. **Port Model Utils** (`web/src/lib/model_utils/` → `Assets/Scripts/ModelUtils/`)

- Port validation logic (`validateAgents.ts`, `validateGameStateInvariants.ts`)
- Port formatting utilities (`formatModelUtils.ts`)
- Port utility functions (`agentUtils.ts`, `missionSiteUtils.ts`, `turnReportUtils.ts`)

4. **Port Reducers** (`web/src/lib/slices/reducers/` → `Assets/Scripts/GameActions/`)

- Convert Redux reducers to C# action methods:
- `agentReducers.ts` → `AgentActions.cs` (hire, sack, assign, recall)
- `leadReducers.ts` → `LeadActions.cs` (create investigation, add agents)
- `missionReducers.ts` → `MissionActions.cs` (deploy agents)
- `upgradeReducers.ts` → `UpgradeActions.cs` (buy upgrades)
- `gameControlsReducers.ts` → `GameControlActions.cs` (advance turn, reset)
- `debugReducers.ts` → `DebugActions.cs` (debug commands)
- Each action method should modify `GameState` immutably (return new state) or use a state manager pattern

### Phase 4: Implement State Management

1. **Create State Manager** (`Assets/Scripts/State/`)

- Replace Redux with Unity-compatible state management:
- `GameStateManager.cs` - Singleton managing current game state
- Implement undo/redo system (similar to `redux-undo`):
- `StateHistory.cs` - Stores state snapshots
- Limit to 100 undo steps (matching current `UNDO_LIMIT`)
- Implement event system for state changes:
- `GameEvent.cs` - Base event class
- `EventLog.cs` - Event logging system (replacing `eventsSlice.ts`)
- Use C# events/delegates for UI updates instead of React's reactive system

2. **Port Selection State** (`web/src/lib/slices/selectionSlice.ts` → `SelectionManager.cs`)

- Manage UI selection state separately from game state

3. **Port Settings State** (`web/src/lib/slices/settingsSlice.ts` → `SettingsManager.cs`)

- Manage user settings (if any)

### Phase 5: Implement Persistence

1. **Create Persistence System** (`Assets/Scripts/Persistence/`)

- Replace IndexedDB with file-based persistence:
- `GameStateSerializer.cs` - Serialize/deserialize `GameState` to JSON
- `SaveManager.cs` - Handle save/load operations
- Use Unity's `Application.persistentDataPath` for save file location
- Implement versioning system (similar to current `STATE_VERSION`)
- Support:
- Save game state to JSON file
- Load game state from JSON file
- Wipe storage functionality

### Phase 6: Port UI Components

1. **Create UI Structure** (`Assets/Scripts/UI/`)

- Set up Unity Canvas hierarchy matching current layout:
- Main Canvas with Grid Layout Groups (replacing MUI Grid)
- Three-column layout matching `App.tsx` structure

2. **Port UI Components** (React → Unity uGUI)

- **Left Column:**
- `GameControls.tsx` → `GameControlsView.cs` + Unity UI prefab
- `PlayerActions.tsx` → `PlayerActionsView.cs` + Unity UI prefab
- `EventLog.tsx` → `EventLogView.cs` + Unity UI prefab (ScrollView)
- `DebugCard.tsx` → `DebugCardView.cs` + Unity UI prefab

- **Middle Column:**
- `MissionsDataGrid.tsx` → `MissionsDataGridView.cs` + Unity UI (Table/ScrollView)
- `LeadsDataGrid.tsx` → `LeadsDataGridView.cs` + Unity UI
- `LeadInvestigationsDataGrid.tsx` → `LeadInvestigationsDataGridView.cs` + Unity UI
- `AgentsDataGrid.tsx` → `AgentsDataGridView.cs` + Unity UI

- **Right Column:**
- `AssetsAndCapabCard.tsx` → `AssetsAndCapabCardView.cs` + Unity UI
- `SituationReportCard.tsx` → `SituationReportCardView.cs` + Unity UI
- `TurnReportDisplay.tsx` → `TurnReportDisplayView.cs` + Unity UI (TreeView)

3. **Implement Data Grids**

- Replace MUI DataGrid with Unity ScrollView + custom table implementation
- Create reusable `DataGrid` component for Unity
- Implement sorting, filtering, and selection functionality

4. **Replicate MUI Styling**

- Create Unity UI theme matching current MUI dark theme
- Set up color palette, fonts, and spacing
- Create reusable UI prefabs for buttons, cards, chips, etc.

5. **Implement UI Controllers**

- Each view component should:
- Subscribe to state changes via C# events
- Update UI when state changes
- Handle user input and dispatch actions to `GameStateManager`

### Phase 7: Testing and Validation

1. **Port Unit Tests** (`web/test/unit/` → `Assets/Tests/Unit/`)

- Port Vitest tests to Unity Test Framework
- Test all game logic functions
- Test state management operations

2. **Create Integration Tests**

- Test full game flow (turn advancement, agent management, etc.)
- Test persistence (save/load)
- Test undo/redo functionality

3. **Manual Testing**

- Verify all player actions work correctly
- Verify UI matches current web version functionality
- Test on target platforms (Windows/Mac/Linux)

### Phase 8: Build and Deployment

1. **Configure Build Settings**

- Set up build configurations for Windows, Mac, Linux
- Configure application name, icon, and metadata
- Set up build scripts/automation

2. **Optimization**

- Profile performance and optimize hot paths
- Optimize UI updates (only update changed elements)
- Consider object pooling for frequently created/destroyed UI elements

## Key Files to Reference

**Current TypeScript Files:**

- `web/src/lib/model/gameStateModel.ts` - Core game state structure
- `web/src/lib/slices/gameStateSlice.ts` - Redux slice with all actions
- `web/src/lib/game_utils/turn_advancement/evaluateTurn.ts` - Main turn logic
- `web/src/app/store.ts` - Redux store setup with undo/redo
- `web/src/app/persist.ts` - Persistence implementation
- `web/src/app/App.tsx` - Main UI layout
- `web/src/components/` - All UI components

**Target Unity Files:**

- `Assets/Scripts/Model/GameState.cs` - Core game state class
- `Assets/Scripts/State/GameStateManager.cs` - State management singleton
- `Assets/Scripts/GameUtils/TurnEvaluator.cs` - Turn advancement logic
- `Assets/Scripts/Persistence/SaveManager.cs` - Save/load system
- `Assets/Scenes/MainScene.unity` - Main game scene
- `Assets/Scripts/UI/` - All UI view controllers

## Considerations

1. **Immutability**: Current code uses immutable state updates. In C#, consider:

- Using structs for value types where appropriate
- Implementing copy constructors or `Clone()` methods
- Or using a mutable state with careful change tracking

2. **Type System**: TypeScript's type system is more flexible. Ensure C# types match exactly:

- Use `decimal` for Fixed6 calculations (or custom struct)
- Use enums for string literal types (`AgentState`, etc.)
- Use nullable types (`T?`) for optional fields

3. **UI Performance**: Unity UI can be slower than React for complex layouts:

- Use object pooling for list items
- Implement efficient update patterns (only update changed elements)
- Consider using Unity's UI Toolkit (newer) instead of uGUI if needed

4. **Testing**: Maintain test coverage parity with current codebase

5. **Code Organization**: Keep similar folder structure to aid in porting and maintenance

### To-dos

- [ ] Create Unity project structure with proper folder organization and Assembly Definitions
- [ ] Port Fixed6, math, format, and assertion primitives from TypeScript to C#
- [ ] Convert all TypeScript model types (GameState, Agent, Faction, etc.) to C# classes/structs
- [ ] Port reference data collections (factions, missions, leads, etc.) to C#
- [ ] Port all ruleset files (constants, initialState, all ruleset files) to C#
- [ ] Port game utility functions (turn evaluation, battle, agent updates, etc.) to C#
- [ ] Convert Redux reducers to C# action methods (agent, lead, mission, upgrade, game control actions)
- [ ] Create GameStateManager with undo/redo system and event logging to replace Redux
- [ ] Create file-based save/load system to replace IndexedDB
- [ ] Set up Unity Canvas hierarchy matching current React layout (three-column grid)
- [ ] Port all React UI components to Unity uGUI views (GameControls, DataGrids, Cards, etc.)
- [ ] Create Unity DataGrid component to replace MUI DataGrid functionality
- [ ] Create Unity UI theme matching current MUI dark theme (colors, fonts, spacing)
- [ ] Port unit tests from Vitest to Unity Test Framework
- [ ] Configure Unity build settings for Windows/Mac/Linux desktop builds