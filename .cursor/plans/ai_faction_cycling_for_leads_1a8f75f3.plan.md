---
name: AI faction cycling for leads
overview: Implement faction cycling in AI lead selection so the AI rotates through factions across turns instead of always chasing the hardest missions, with separate priority rotations for repeatable and non-repeatable leads.
todos:
  - id: add-get-faction-id
    content: Add `getFactionIdForLead` utility to `web/src/lib/model_utils/leadUtils.ts`
    status: pending
  - id: add-priority-helper
    content: Add `getFactionPriorityOrder` helper to `web/src/ai/intellects/basic/leadInvestigation.ts`
    status: pending
  - id: refactor-non-repeatable
    content: Refactor non-repeatable lead selection to use faction priority instead of random
    status: pending
  - id: refactor-repeatable
    content: Refactor repeatable lead selection to use faction priority as primary sort key
    status: pending
  - id: add-logging
    content: Add logging for faction priority decisions
    status: pending
  - id: run-qcheck
    content: Run `qcheck` to verify correctness
    status: pending
isProject: false
---

# AI Faction Cycling for Lead Investigation

## Problem

Currently in `selectLeadToInvestigate` ([leadInvestigation.ts](web/src/ai/intellects/basic/leadInvestigation.ts)):

- Non-repeatable leads are selected with `pickAtRandom`
- Repeatable leads are sorted by combat rating descending (hardest first)

This causes the AI to ignore easier factions entirely, since it always prefers the hardest missions.

## Design

The faction priority order is derived purely from `gameState.turn` and the faction list (3 factions: Red Dawn, Exalt, Black Lotus), so **no new persistent AI state is needed**.

- **Repeatable leads** use offset `0`: on turn 1 priority is `[RedDawn, Exalt, BlackLotus]`, on turn 2 `[Exalt, BlackLotus, RedDawn]`, etc.
- **Non-repeatable leads** use offset `1`: shifted by one position from repeatable, so on any given turn the two categories prioritize different factions.

Formula: for a given `turn` and `offset`, the priority-ordered faction list is:

```typescript
const startIndex = (turn - 1 + offset) % factions.length
// rotate factions starting at startIndex
```

## Changes

### 1. Add `getFactionIdForLead` to [web/src/lib/model_utils/leadUtils.ts](web/src/lib/model_utils/leadUtils.ts)

A new utility function to extract the `FactionId` from a lead's ID pattern (`lead-{facId}-{...}`), returning `undefined` for faction-agnostic leads (like `lead-criminal-orgs`). This reuses the same pattern already in `isFactionForLeadTerminated` but returns the ID directly.

```typescript
export function getFactionIdForLead(lead: Lead): FactionId | undefined {
  for (const factionData of dataTables.factions) {
    const facId = factionData.factionDataId.replace('factiondata-', '')
    if (lead.id.startsWith(`lead-${facId}-`)) {
      return factionData.id
    }
  }
  return undefined
}
```

### 2. Modify [web/src/ai/intellects/basic/leadInvestigation.ts](web/src/ai/intellects/basic/leadInvestigation.ts)

Add a helper to compute faction priority order:

```typescript
function getFactionPriorityOrder(turn: number, offset: number): FactionId[] {
  const factions = dataTables.factions
  const startIndex = (turn - 1 + offset) % factions.length
  return [
    ...factions.slice(startIndex),
    ...factions.slice(0, startIndex),
  ].map(f => f.id)
}
```

Rewrite `selectLeadToInvestigate`:

- **Non-repeatable branch**: Instead of `pickAtRandom(nonRepeatableLeads)`:
  1. Separate faction-agnostic leads (no faction) from faction-specific leads
  2. If faction-agnostic leads exist, return the first one (they are unique progression leads)
  3. Otherwise, get faction priority order with `offset = 1`
  4. For each faction in priority order, collect matching leads; return the first match found (pick at random if multiple leads share the same top-priority faction)
- **Repeatable branch**: Instead of sorting purely by combat rating:
  1. Get faction priority order with `offset = 0`
  2. For each faction in priority order, filter repeatable leads belonging to that faction
  3. For the first faction with deployable leads, apply existing tiebreaking logic (max combat rating, then min investigation count, then random)
  4. If no leads from this faction are deployable, try the next faction in priority order

### 3. Update the piling logic for existing repeatable investigations

In `assignToLeadInvestigation` (lines 63-77), when checking for an existing repeatable investigation to pile onto, no changes are needed -- piling onto an existing active repeatable investigation should still take precedence over starting a new one, regardless of faction cycling.

## Key behaviors preserved

- Repeatable leads still checked for mission deployability before selection
- Combat rating tiebreaking still applies within a faction
- Agent piling onto existing repeatable investigations remains unchanged
- `lead-deep-state` exclusion remains unchanged
- Faction-agnostic non-repeatable leads (e.g., `lead-criminal-orgs`) get highest priority (they are unique early-game progression leads)

## Logging

Add log output for faction priority decisions to make behavior observable:

```typescript
log.info('lead-investigation', `Faction priority (repeatable): [${priorities.join(', ')}]`)
```
