---
name: Extract Reusable AI Intellect Logic
overview: Extract reusable logic patterns from basicIntellect.ts into shared utility functions that can be used by multiple intellects, improving code reuse and maintainability.
todos:
  - id: create_utils_dir
    content: Create web/src/ai/utils/ directory structure
    status: pending
  - id: extract_hire_agents
    content: Extract agent hiring logic to hireAgents.ts and update both intellects
    status: pending
    dependencies:
      - create_utils_dir
  - id: extract_mission_deployment
    content: Extract mission deployment pattern to deployToMissions.ts and refactor both intellects
    status: pending
    dependencies:
      - create_utils_dir
  - id: extract_lead_investigation
    content: Extract lead investigation dependency checking to leadInvestigationUtils.ts
    status: pending
    dependencies:
      - create_utils_dir
  - id: extract_upgrade_purchasing
    content: Extract upgrade purchasing logic to upgradeUtils.ts
    status: pending
    dependencies:
      - create_utils_dir
  - id: extract_agent_assignment
    content: Extract agent assignment utilities to agentAssignmentUtils.ts
    status: pending
    dependencies:
      - create_utils_dir
  - id: verify_changes
    content: Run qcheck to verify all changes work correctly
    status: pending
    dependencies:
      - extract_hire_agents
      - extract_mission_deployment
      - extract_lead_investigation
      - extract_upgrade_purchasing
      - extract_agent_assignment
---

# Extract Reusable AI Intellect Logic

## Overview

Extract reusable logic patterns from `basicIntellect.ts` into shared utility functions in a new `web/src/ai/utils/` directory. This will allow multiple intellects to share common functionality while maintaining their unique decision-making logic.

## Analysis

The following reusable patterns were identified in `basicIntellect.ts`:

1. **Agent hiring logic** (lines 34-43) - Duplicated in `basicIntellectV2.ts`
2. **Mission deployment pattern** - Shared structure between `deployToDefensiveMissions` and `deployToOffensiveMissions`
3. **Lead investigation dependency checking** (lines 187-195) - Reusable dependency validation logic
4. **Upgrade purchasing** (lines 67-85) - Prioritized upgrade purchasing logic
5. **Agent assignment to contracting** - Simple but duplicated pattern

## Implementation Plan

### 1. Create AI utilities directory structure

Create `web/src/ai/utils/` directory with the following files:

- `hireAgents.ts` - Agent hiring logic
- `deployToMissions.ts` - Generic mission deployment utilities
- `leadInvestigationUtils.ts` - Lead investigation dependency checking
- `upgradeUtils.ts` - Upgrade purchasing logic
- `agentAssignmentUtils.ts` - Agent assignment utilities

### 2. Extract agent hiring logic

**File**: `web/src/ai/utils/hireAgents.ts`Extract the agent hiring loop into a reusable function:

```typescript
export function hireAgentsUpToCap(
  getState: () => GameState,
  dispatch: AppDispatch,
  options?: { checkMoneyAfterEach?: boolean }
): void
```

This function will:

- Check if money is available and agents are below cap
- Hire agents in a loop
- Optionally check money constraints after each hire (for `basicIntellectV2`)

**Update files**:

- `web/src/ai/intellects/basicIntellect.ts` - Replace lines 34-43 with call to utility
- `web/src/ai/intellects/basicIntellectV2.ts` - Replace lines 61-73 with call to utility

### 3. Extract mission deployment utilities

**File**: `web/src/ai/utils/deployToMissions.ts`Create generic mission deployment functions:

1. `deployAgentsToMissions` - Generic function that takes:

- Mission filter/prioritizer function
- Agent selector function (determines how many agents to deploy)
- Options for deployment behavior

2. Helper functions for common patterns:

- `prioritizeDefensiveMissions` - Sort defensive missions by operation level and expiry
- `selectAgentsForDeployment` - Select agents based on transport cap and limits

**Update files**:

- `web/src/ai/intellects/basicIntellect.ts` - Refactor `deployToDefensiveMissions` and `deployToOffensiveMissions` to use utilities
- `web/src/ai/intellects/basicIntellectV2.ts` - Refactor `deployToMissions` to use utilities if applicable

### 4. Extract lead investigation utilities

**File**: `web/src/ai/utils/leadInvestigationUtils.ts`Extract dependency checking logic:

```typescript
export function checkLeadDependencies(
  lead: Lead,
  state: GameState
): boolean
```

This function will handle:

- Mission dependency checking (starts with 'missiondata-')
- Lead dependency checking
- Return true if all dependencies are met

**Update files**:

- `web/src/ai/intellects/basicIntellect.ts` - Replace lines 187-195 with call to utility

### 5. Extract upgrade purchasing logic

**File**: `web/src/ai/utils/upgradeUtils.ts`Create upgrade purchasing utilities:

```typescript
export function buyUpgradesByPriority(
  getState: () => GameState,
  dispatch: AppDispatch,
  priority: (keyof typeof UPGRADE_PRICES)[],
  options?: { maxPurchases?: number; checkAfterEach?: boolean }
): void
```

**Update files**:

- `web/src/ai/intellects/basicIntellect.ts` - Replace lines 67-85 with call to utility

### 6. Extract agent assignment utilities

**File**: `web/src/ai/utils/agentAssignmentUtils.ts`Create simple utility for assigning agents to contracting:

```typescript
export function assignAvailableAgentsToContracting(
  getState: () => GameState,
  dispatch: AppDispatch,
  availableAgents: Agent[]
): void
```

**Update files**:

- `web/src/ai/intellects/basicIntellect.ts` - Replace lines 59-63 with call to utility
- `web/src/ai/intellects/basicIntellectV2.ts` - Replace similar patterns if found

## Dependencies

All utilities will:

- Import from `web/src/redux/store` for `AppDispatch` type
- Import from `web/src/lib/model/gameStateModel` for `GameState` type
- Import from `web/src/lib/model_utils/` for agent and mission utilities
- Import from `web/src/redux/slices/gameStateSlice` for action creators
- Follow code dependency rules (ai/ can import from redux/ and lib/)

## Testing Considerations

After extraction:

- Run `qcheck` to verify no regressions
- Verify both `basicIntellect` and `basicIntellectV2` still work correctly
- Ensure extracted functions maintain the same behavior as original code