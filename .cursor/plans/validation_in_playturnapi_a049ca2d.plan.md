---
name: Validation in PlayTurnAPI
overview: Move validation logic from PlayerActions.tsx into PlayTurnAPI, making it the canonical validation layer for all player actions (both UI and AI). API methods will validate before dispatching and return success/error results.
todos:
  - id: types
    content: Update PlayTurnAPI type in types.ts with ActionResult return type
    status: pending
  - id: validate-funcs
    content: Create validatePlayerActions.ts with consolidated validation functions
    status: pending
    dependencies:
      - types
  - id: playTurnApi
    content: Update playTurnApi.ts to validate before dispatch and return results
    status: pending
    dependencies:
      - validate-funcs
  - id: playerActions
    content: Refactor PlayerActions.tsx to use PlayTurnAPI instead of direct dispatch
    status: pending
    dependencies:
      - playTurnApi
  - id: handleInvestigateLead
    content: Refactor handleInvestigateLead.ts to use PlayTurnAPI
    status: pending
    dependencies:
      - playTurnApi
---

# Move Validation Logic into PlayTurnAPI

## Problem

Currently, validation for player actions is split:

- **UI layer** (`PlayerActions.tsx`): Validates before dispatching Redux actions
- **AI layer** (`basicIntellect.ts`): Calls `PlayTurnAPI` which bypasses validation entirely
- **Reducers**: Trust input blindly, no validation

This allows the AI player to perform invalid actions (e.g., deploying recovering/exhausted agents to missions).

## Solution

Make `PlayTurnAPI` the canonical validation layer:

```mermaid
flowchart LR
    subgraph Before
        UI1[PlayerActions.tsx] -->|validates| UI2[dispatch]
        AI1[basicIntellect.ts] -->|no validation| API1[PlayTurnAPI] --> D1[dispatch]
    end
```



```mermaid
flowchart LR
    subgraph After
        UI[PlayerActions.tsx] --> API[PlayTurnAPI]
        AI[basicIntellect.ts] --> API
        API -->|validates| V{Valid?}
        V -->|yes| D[dispatch]
        V -->|no| E[return error]
    end
```



## Key Design Decisions

1. **API methods return results**: Each method returns `{ success: true }` or `{ success: false, errorMessage: string }`
2. **Validation functions stay in `lib/model_utils/`**: They're pure functions without Redux dependencies
3. **UI handles selection clearing**: `PlayerActions.tsx` continues to manage UI-specific state (clearing selections after success)

## Files to Modify

### 1. [web/src/ai/types.ts](web/src/ai/types.ts)

Update `PlayTurnAPI` type to return validation results:

```typescript
export type ActionResult =
  | { success: true }
  | { success: false; errorMessage: string }

export type PlayTurnAPI = {
  gameState: GameState
  hireAgent(): ActionResult
  sackAgents(agentIds: string[]): ActionResult
  // ... etc
}
```



### 2. Create `web/src/lib/model_utils/validatePlayerActions.ts`

Consolidate all validation logic into pure functions. Move/extract from `PlayerActions.tsx`:

- `validateHireAgent(gameState)` - checks money and agent cap
- `validateAssignToContracting(gameState, agentIds)` - checks available + not exhausted
- `validateAssignToTraining(gameState, agentIds)` - checks available + not exhausted + training cap
- `validateDeployAgents(gameState, missionId, agentIds)` - checks available + not exhausted + transport cap + mission state
- `validateBuyUpgrade(gameState, upgradeName)` - checks money
- etc.

### 3. [web/src/ai/playTurnApi.ts](web/src/ai/playTurnApi.ts)

Add validation before each dispatch:

```typescript
hireAgent(): ActionResult {
  const validation = validateHireAgent(api.gameState)
  if (!validation.isValid) {
    return { success: false, errorMessage: validation.errorMessage }
  }
  store.dispatch(hireAgent())
  updateGameState()
  return { success: true }
}
```



### 4. [web/src/components/GameControls/PlayerActions.tsx](web/src/components/GameControls/PlayerActions.tsx)

Refactor to use `PlayTurnAPI` instead of direct dispatch:

```typescript
function handleHireAgent(): void {
  const result = api.hireAgent()
  if (!result.success) {
    setAlertMessage(result.errorMessage)
    setShowAlert(true)
    return
  }
  setShowAlert(false)
}
```



### 5. [web/src/components/GameControls/handleInvestigateLead.ts](web/src/components/GameControls/handleInvestigateLead.ts)

Refactor to use `PlayTurnAPI` for lead investigation actions.

## Dependency Compliance

Per [about_code_dependencies.md](docs/design/about_code_dependencies.md):