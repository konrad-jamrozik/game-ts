---
name: Extract Lead Status Logic
overview: Extract the duplicated lead status logic (discovered, active, inactive, archived) from LeadsDataGrid, leadCounts, and AI's getAvailableLeads into a shared utility in leadUtils.ts, fixing the AI's negated dependency bug in the process.
todos:
  - id: add-shared-utils
    content: Add LeadStatus type and getLeadStatus/getDiscoveredLeads/getAvailableLeadsForInvestigation functions to leadUtils.ts
    status: completed
  - id: refactor-datagrid
    content: Refactor LeadsDataGrid.tsx to use shared lead status functions
    status: completed
    dependencies:
      - add-shared-utils
  - id: refactor-counts
    content: Refactor leadCounts.ts to use shared getLeadStatus function
    status: completed
    dependencies:
      - add-shared-utils
  - id: refactor-ai
    content: Refactor AI's getAvailableLeads in leadInvestigation.ts to use getAvailableLeadsForInvestigation
    status: completed
    dependencies:
      - add-shared-utils
  - id: verify
    content: Run qcheck to verify no lint/type errors
    status: completed
    dependencies:
      - refactor-datagrid
      - refactor-counts
      - refactor-ai
---

# Extract Lead Status Logic to Shared Utility

## Problem

The logic for determining lead status (discovered, active, inactive, archived) is duplicated across:

- [`LeadsDataGrid.tsx`](web/src/components/LeadsDataGrid/LeadsDataGrid.tsx) (lines 31-67)
- [`leadCounts.ts`](web/src/components/LeadsDataGrid/leadCounts.ts) (lines 29-49)
- AI's [`leadInvestigation.ts`](web/src/ai/intellects/basic/leadInvestigation.ts) `getAvailableLeads` (lines 159-207)

The AI version has a bug - it doesn't handle negated dependencies (prefixed with `!`), causing leads like "Locate EXALT HQ" to be filtered out incorrectly.

## Solution

Extract shared lead status computation to [`leadUtils.ts`](web/src/lib/model_utils/leadUtils.ts), which is already the home for related functions and is accessible by both components (via `lib/game_utils`) and AI code per the dependency rules.

## Implementation

### 1. Add shared types and functions to `leadUtils.ts`

Add a new `LeadStatus` type and helper functions:

```typescript
export type LeadStatus = {
  isDiscovered: boolean
  isActive: boolean
  isInactive: boolean
  isArchived: boolean
  hasActiveInvestigation: boolean
  hasDoneInvestigation: boolean
}

// Computes status for a single lead
export function getLeadStatus(lead: Lead, gameState: GameState): LeadStatus

// Returns all discovered leads (dependencies met)
export function getDiscoveredLeads(gameState: GameState): Lead[]

// Returns leads available for new investigations (active, not already being investigated)
export function getAvailableLeadsForInvestigation(gameState: GameState): Lead[]
```

The `getAvailableLeadsForInvestigation` function will:

- Filter for discovered leads
- Exclude archived and inactive leads
- Exclude leads that already have active investigations
- Exclude repeatable leads that are already under investigation
- Exclude `lead-deep-state` (AI-specific exclusion)

### 2. Refactor `LeadsDataGrid.tsx`

Replace inline logic (lines 31-67) with calls to the new shared functions.

### 3. Refactor `leadCounts.ts`

Replace duplicated isArchived/isInactive logic with calls to `getLeadStatus()`.

### 4. Refactor AI's `getAvailableLeads`

Replace the entire function body with a call to `getAvailableLeadsForInvestigation()`, adding only the AI-specific filter for `lead-deep-state`.

## Key Files Changed

| File | Change |

|------|--------|

| [`leadUtils.ts`](web/src/lib/model_utils/leadUtils.ts) | Add `LeadStatus` type and 3 new functions |

| [`LeadsDataGrid.tsx`](web/src/components/LeadsDataGrid/LeadsDataGrid.tsx) | Use shared `getDiscoveredLeads` and `getLeadStatus` |

| [`leadCounts.ts`](web/src/components/LeadsDataGrid/leadCounts.ts) | Use shared `getLeadStatus` |

| [`leadInvestigation.ts`](web/src/ai/intellects/basic/leadInvestigation.ts) | Replace `getAvailableLeads` with call to shared function |
