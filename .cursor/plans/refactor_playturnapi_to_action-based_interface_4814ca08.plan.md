---
name: Refactor PlayTurnAPI to Action-Based Interface
overview: Move getPlayTurnApi() to playTurnApi.ts and refactor it to expose action wrapper methods instead of dispatch, with automatic gameState updates after each action.
todos:
  - id: create-playTurnApi-file
    content: Create web/src/ai/playTurnApi.ts with getPlayTurnApi() function and action wrapper methods
    status: completed
  - id: update-types
    content: Update PlayTurnAPI type in web/src/ai/types.ts to remove getState/dispatch and add gameState property and action methods
    status: completed
  - id: update-delegateTurnToAIPlayer
    content: Update web/src/ai/delegateTurnToAIPlayer.ts to import getPlayTurnApi from new file and use api.gameState
    status: completed
    dependencies:
      - create-playTurnApi-file
      - update-types
  - id: update-intellects
    content: Check and update any AI intellect implementations that use api.getState() or api.dispatch to use new API
    status: completed
    dependencies:
      - update-delegateTurnToAIPlayer
---

# Refactor PlayTurnAPI to Action-Based Interface

## Overview

Refactor `getPlayTurnApi()` to move it to a dedicated file and change its interface from exposing `dispatch` directly to exposing action wrapper methods. The API will automatically update `gameState` after each action is dispatched, so AI players can always access the latest state via `api.gameState` without needing to call `getState()`.

## Current State

The current `getPlayTurnApi()` function in `web/src/ai/delegateTurnToAIPlayer.ts` returns:

```typescript
{
  getState: () => store.getState().undoable.present.gameState,
  dispatch: store.dispatch,
}
```

The AI player currently needs to call `api.getState()` after each action to get updated state.

## Target State

The new API will:

- Expose action wrapper methods (e.g., `hireAgent()`, `sackAgents(agentIds)`, etc.)
- Have a `gameState` property that's automatically kept up-to-date
- Remove `getState()` and `dispatch` from the interface
- Update `gameState` synchronously after each action is dispatched

## Implementation

### 1. Create `web/src/ai/playTurnApi.ts`

Create a new file with:

- `getPlayTurnApi()` function that returns a `PlayTurnAPI` object
- Action wrapper methods that dispatch Redux actions and update `gameState`
- A `gameState` property that's automatically updated

**Action wrappers to implement:**

- `hireAgent(): void` - wraps `hireAgent()` action (no params)
- `sackAgents(agentIds: string[]): void` - wraps `sackAgents(agentIds)` action
- `assignAgentsToContracting(agentIds: string[]): void` - wraps `assignAgentsToContracting(agentIds)` action
- `assignAgentsToTraining(agentIds: string[]): void` - wraps `assignAgentsToTraining(agentIds)` action
- `recallAgents(agentIds: string[]): void` - wraps `recallAgents(agentIds)` action
- `startLeadInvestigation(params: { leadId: string; agentIds: string[] }): void` - wraps `startLeadInvestigation({ leadId, agentIds })` action
- `addAgentsToInvestigation(params: { investigationId: string; agentIds: string[] }): void` - wraps `addAgentsToInvestigation({ investigationId, agentIds })` action
- `deployAgentsToMission(params: { missionId: string; agentIds: string[] }): void` - wraps `deployAgentsToMission({ missionId, agentIds })` action
- `buyUpgrade(upgradeName: UpgradeName): void` - wraps `buyUpgrade(upgradeName)` action

**Note:** `assignAgentsToEspionage` is mentioned in the plan document but doesn't exist in the Redux slice yet. It will be omitted for now but can be added later when the action is implemented.**Implementation pattern for each action wrapper:**

```typescript
hireAgent(): void {
  store.dispatch(hireAgent())
  this.gameState = store.getState().undoable.present.gameState
}
```



### 2. Update `web/src/ai/types.ts`

Update the `PlayTurnAPI` type to:

- Remove `getState` and `dispatch` properties
- Add `gameState: GameState` property (read-only from AI perspective, but mutable internally)
- Add all action wrapper method signatures

### 3. Update `web/src/ai/delegateTurnToAIPlayer.ts`

- Remove the `getPlayTurnApi()` function
- Import `getPlayTurnApi` from `./playTurnApi`
- Update `delegateTurnToAIPlayerV2()` to use `api.gameState` instead of `api.getState()`

### 4. Update any AI intellect implementations

If any AI intellects use `api.getState()` or `api.dispatch`, update them to:

- Use `api.gameState` instead of `api.getState()`
- Use action wrapper methods instead of `api.dispatch(action)`

## Files to Modify

- `web/src/ai/delegateTurnToAIPlayer.ts` - Remove `getPlayTurnApi()`, import from new file, update usage
- `web/src/ai/types.ts` - Update `PlayTurnAPI` type definition

## Files to Create

- `web/src/ai/playTurnApi.ts` - New file with `getPlayTurnApi()` implementation and action wrappers

## Technical Details

- Redux actions are dispatched synchronously, so `store.getState()` can be called immediately after dispatch to get the updated state
- The `gameState` property will be a direct reference that gets reassigned after each action