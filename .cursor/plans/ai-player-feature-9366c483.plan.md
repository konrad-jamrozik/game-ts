---
name: AI Player Feature Implementation Plan
overview: ""
todos:
  - id: 2aa5446c-eee8-41db-aa1c-20494538627c
    content: "Create AI player core infrastructure: interfaces, action types, executor, and registry"
    status: pending
  - id: e45a6254-65c4-457e-b87c-8747d7b2db38
    content: Create aiPlayerSlice Redux slice and integrate into store
    status: pending
  - id: 6938ba38-129b-4daa-acca-763e8499e4ca
    content: Create AiPlayerControls component with dropdown and delegate button
    status: pending
  - id: 0386e195-3671-4924-a5cb-d26606ec8629
    content: Create helper utilities for AI decision-making (agents, missions, leads, factions, resources)
    status: pending
  - id: 015cc51d-e09f-4eee-91d8-e5a727d3771f
    content: Implement basicAiIntellect with core decision logic for all player actions
    status: pending
  - id: 3f6f40eb-751d-49c7-8b5c-181201f8d749
    content: Add AiPlayerControls to GameControls component
    status: pending
  - id: 0792ecb1-c25e-4391-bd42-e9168ecb9458
    content: Test AI intellect through multiple turns and verify reasonable decisions
    status: pending
---

# AI Player Feature Implementation Plan

## Overview

Add an AI Player system that allows users to delegate control to AI intellects. The AI can read game state, execute player actions, and advance turns autonomously. The implementation includes scaffolding for AI player interfaces, a UI for selecting AI intellects, and at least one functional AI intellect implementation.

## Architecture

### 1. AI Player Core Infrastructure

**Location**: `web/src/lib/ai/`Create the core AI player scaffolding:

- **`aiPlayerInterface.ts`**: Define the `AiPlayerIntellect` interface that all AI implementations must follow:
  ```typescript
                    type AiPlayerIntellect = {
                      id: string
                      name: string
                      description: string
                      executeTurn: (gameState: GameState) => AiPlayerAction[]
                    }
  ```




- **`aiPlayerActions.ts`**: Define types for AI player actions (wrappers around Redux actions):
  ```typescript
                    type AiPlayerAction = 
                      | { type: 'hireAgent' }
                      | { type: 'sackAgents', agentIds: string[] }
                      | { type: 'assignAgentsToContracting', agentIds: string[] }
                      | { type: 'assignAgentsToEspionage', agentIds: string[] }
                      | { type: 'assignAgentsToTraining', agentIds: string[] }
                      | { type: 'recallAgents', agentIds: string[] }
                      | { type: 'createLeadInvestigation', leadId: string, agentIds: string[] }
                      | { type: 'addAgentsToInvestigation', investigationId: string, agentIds: string[] }
                      | { type: 'deployAgentsToMission', missionSiteId: string, agentIds: string[] }
                      | { type: 'buyUpgrade', upgradeName: UpgradeName }
                      | { type: 'advanceTurn' }
  ```




- **`aiPlayerExecutor.ts`**: Executor that takes an AI intellect, reads game state, executes actions, and dispatches Redux actions:
  ```typescript
                    function executeAiTurn(
                      intellect: AiPlayerIntellect,
                      gameState: GameState,
                      dispatch: AppDispatch
                    ): void
  ```




- **`aiPlayerRegistry.ts`**: Registry for available AI intellects:
  ```typescript
                    const aiIntellects: AiPlayerIntellect[] = [...]
                    export function getAiIntellectById(id: string): AiPlayerIntellect | undefined
                    export function getAllAiIntellects(): AiPlayerIntellect[]
  ```




### 2. AI Intellect Implementation

**Location**: `web/src/lib/ai/intellects/`Create at least one functional AI intellect:

- **`basicAiIntellect.ts`**: A basic AI that can successfully play the game:
- **Agent Management**:
    - Hire agents when money is available and agent cap allows
    - Fire low-skill agents if agent cap is reached and better agents are available
    - Assign agents to contracting/espionage based on resource needs
    - Assign agents to training when training slots are available
- **Lead Investigation**:
    - Prioritize leads based on dependencies and difficulty
    - Assign available agents to lead investigations
    - Add more agents to existing investigations if needed
- **Mission Deployment**:
    - Evaluate mission sites for deployment priority (based on rewards, expiration, enemy strength)
    - Deploy appropriate number of agents to missions (considering transport cap)
    - Prioritize missions that reduce panic or suppress high-threat factions
- **Upgrades**:
    - Purchase upgrades based on current needs (e.g., agent cap when at limit, transport cap when deploying missions)
- **Panic Management**:
    - Focus on factions with highest threat levels relative to suppression
    - Prioritize missions that suppress high-threat factions

The AI should:

- Read game state using the same selectors/access patterns as the UI
- Make decisions based on current game state
- Execute actions in a logical order (e.g., hire agents before assigning them)
- Handle edge cases (insufficient funds, caps reached, etc.)

### 3. Redux Integration

**Location**: `web/src/lib/slices/`

- **`aiPlayerSlice.ts`**: Redux slice for AI player state:
  ```typescript
                    type AiPlayerState = {
                      selectedIntellectId: string | undefined
                      isExecuting: boolean
                    }
  ```


Actions:

- `setSelectedIntellect(intellectId: string | undefined)`
- `setIsExecuting(isExecuting: boolean)`

Add to `web/src/app/store.ts` root reducer.

### 4. UI Components

**Location**: `web/src/components/GameControls/`

- **`AiPlayerControls.tsx`**: New component with:
- Dropdown (MUI Select) to choose AI intellect from registry
- "Delegate to AI" button that:
    - Gets current game state from Redux
    - Executes selected AI intellect for one turn
    - Dispatches all actions generated by AI
    - Advances turn after actions complete
    - Shows loading state during execution
    - Disables button if no intellect selected or game is over

Add to `web/src/components/GameControls/GameControls.tsx` to display alongside existing controls.

### 5. Action Execution Flow

The executor (`aiPlayerExecutor.ts`) should:

1. Get current game state from Redux store
2. Call `intellect.executeTurn(gameState)` to get array of actions
3. For each action in sequence:

- Map AI action to Redux action creator
- Dispatch Redux action
- Wait for state update (if needed)

4. After all actions, dispatch `advanceTurn()` if not already included
5. Handle errors gracefully (log and stop execution)

### 6. Helper Utilities

**Location**: `web/src/lib/ai/utils/`Create utilities for AI decision-making:

- **`agentUtils.ts`**: Helper functions for evaluating agents (skill, exhaustion, availability)
- **`missionUtils.ts`**: Helper functions for evaluating missions (priority, required agents, rewards)
- **`leadUtils.ts`**: Helper functions for evaluating leads (priority, difficulty, dependencies)
- **`factionUtils.ts`**: Helper functions for evaluating factions (threat level, suppression, panic contribution)
- **`resourceUtils.ts`**: Helper functions for evaluating resources (money, intel, caps)

## Implementation Steps

1. **Create AI infrastructure** (`aiPlayerInterface.ts`, `aiPlayerActions.ts`, `aiPlayerExecutor.ts`, `aiPlayerRegistry.ts`)
2. **Create Redux slice** (`aiPlayerSlice.ts`) and integrate into store
3. **Create UI component** (`AiPlayerControls.tsx`) and add to GameControls
4. **Create helper utilities** for AI decision-making
5. **Implement basic AI intellect** (`basicAiIntellect.ts`) with core decision logic
6. **Test AI intellect** by running it through multiple turns and verifying it makes reasonable decisions
7. **Add error handling** and edge case handling in executor
8. **Verify AI actions appear in event log** (should work automatically via existing eventsMiddleware)

## Key Files to Modify

- `web/src/app/store.ts` - Add aiPlayer reducer
- `web/src/components/GameControls/GameControls.tsx` - Add AiPlayerControls component
- `web/src/app/eventsMiddleware.ts` - Verify AI actions are logged (should work automatically)

## Key Files to Create

- `web/src/lib/ai/aiPlayerInterface.ts`
- `web/src/lib/ai/aiPlayerActions.ts`
- `web/src/lib/ai/aiPlayerExecutor.ts`
- `web/src/lib/ai/aiPlayerRegistry.ts`
- `web/src/lib/slices/aiPlayerSlice.ts`
- `web/src/lib/ai/intellects/basicAiIntellect.ts`
- `web/src/lib/ai/utils/agentUtils.ts`
- `web/src/lib/ai/utils/missionUtils.ts`
- `web/src/lib/ai/utils/leadUtils.ts`
- `web/src/lib/ai/utils/factionUtils.ts`
- `web/src/lib/ai/utils/resourceUtils.ts`
- `web/src/components/GameControls/AiPlayerControls.tsx`

## Testing Considerations

- Test AI intellect with various game states (early game, mid game, late game)
- Verify AI actions are properly dispatched and appear in event log