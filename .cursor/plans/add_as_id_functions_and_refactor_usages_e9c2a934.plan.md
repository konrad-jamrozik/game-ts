---
name: Add as*Id functions and refactor usages
overview: Add asFactionId, asLeadInvestigationId, asMissionId (and optionally asAgentId, asMissionDataId) functions to modelIds.ts following the asLeadId pattern, then refactor formatUtils.ts to use these functions instead of assertIs*Id calls.
todos:
  - id: "1"
    content: Add asFactionId, asLeadInvestigationId, asMissionId, asAgentId, and asMissionDataId functions to modelIds.ts
    status: completed
  - id: "2"
    content: Update formatUtils.ts to use asFactionId, asLeadInvestigationId, and asMissionId instead of assertIs*Id calls
    status: completed
    dependencies:
      - "1"
  - id: "3"
    content: Update imports in formatUtils.ts to include new as*Id functions and remove unused assertIs*Id imports
    status: completed
    dependencies:
      - "2"
---

# Add as*Id functions and refactor usages

Add `as*Id` wrapper functions for ID validation, following the existing `asLeadId` pattern. These functions validate and return the typed ID, making the code more concise when you need the validated ID value.

## Changes

### 1. Add as*Id functions to `web/src/lib/model/modelIds.ts`

Add the following functions following the `asLeadId` pattern:

- `asFactionId(id: string): FactionId` - wraps `assertIsFactionId`
- `asLeadInvestigationId(id: string): LeadInvestigationId` - wraps `assertIsLeadInvestigationId`
- `asMissionId(id: string): MissionId` - wraps `assertIsMissionId`
- `asAgentId(id: string): AgentId` - wraps `assertIsAgentId` (for consistency, even though not currently used)
- `asMissionDataId(id: string): MissionDataId` - wraps `assertIsMissionDataId` (for consistency, even though not currently used)

Place them right after `asLeadId` (around line 15), before the `assertIs*Id` functions.

### 2. Refactor `web/src/lib/model_utils/formatUtils.ts`

Update `fmtIdForDisplay` function to use the new `as*Id` functions:

- Line 111: Replace `assertIsFactionId(id)` with `asFactionId(id)` and use the returned value
- Line 122: Replace `assertIsLeadInvestigationId(id)` with `asLeadInvestigationId(id)` and use the returned value  
- Line 132: Replace `assertIsMissionId(id)` with `asMissionId(id)` and use the returned value

Update imports to include the new `as*Id` functions and remove the `assertIs*Id` imports that are no longer needed.

## Benefits

- More concise code: `const typedId = asFactionId(id)` instead of `assertIsFactionId(id); const typedId = id`