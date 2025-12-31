---
name: Fix Lead Archival Bug
overview: Fix the regex bug in `isFactionForLeadTerminated` that fails to correctly identify faction-to-lead relationships when faction IDs contain dashes (e.g., "black-lotus"), causing discovered leads to not be archived when their faction is terminated.
todos:
  - id: fix-regex
    content: Fix isFactionForLeadTerminated to use startsWith instead of greedy regex
    status: pending
---

# Fix Lead Archival Bug for Terminated Factions

## Problem

When a faction is terminated (e.g., Black Lotus), discovered leads belonging to that faction should be marked as archived. However, the validation fails with:

```
Lead lead-black-lotus-training-facility for terminated faction faction-black-lotus is discovered but not archived
```

## Root Cause

The bug is in [`web/src/lib/model_utils/leadUtils.ts`](web/src/lib/model_utils/leadUtils.ts) in the `isFactionForLeadTerminated` function (lines 24-44):

```typescript
const leadIdMatch = /^lead-(?<facId>.+)-/u.exec(lead.id)
```

The regex uses a **greedy** `.+` pattern which matches too much when faction IDs contain dashes:

- Lead ID: `lead-black-lotus-training-facility`
- Expected faction ID: `black-lotus`
- Actual extracted ID: `black-lotus-training` (greedy match stops at the **last** `-`)

This causes the faction lookup to fail since `factiondata-black-lotus-training` doesn't exist.

## Solution

Replace the ambiguous regex approach with the same pattern used elsewhere in the codebase (in `validateGameStateInvariants.ts` and `terminateFaction`): iterate through factions and use `startsWith` to match leads to their faction.

**Change `isFactionForLeadTerminated` to:**

```typescript
export function isFactionForLeadTerminated(
  lead: Lead,
  factions: Faction[],
  leadInvestigationCounts: Record<string, number>,
): boolean {
  // Find the faction whose leads include this lead
  // Lead IDs follow pattern: lead-{facId}-{leadName}
  for (const faction of factions) {
    const facId = faction.factionDataId.replace('factiondata-', '')
    if (lead.id.startsWith(`lead-${facId}-`)) {
      return isFactionTerminated(faction, leadInvestigationCounts)
    }
  }
  return false
}
```

This approach:

1. Iterates through all factions
2. Extracts the faction short ID from `factionDataId`
3. Checks if the lead ID starts with `lead-{facId}-`
4. Returns the termination status if a match is found

This matches the pattern used in `validateTerminatedFactionLeads` and `terminateFaction`, ensuring consistency across the codebase.
