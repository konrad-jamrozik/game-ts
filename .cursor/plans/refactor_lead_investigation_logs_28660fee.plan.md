---
name: Refactor lead investigation logs
overview: Rename the "lead-investigation" log category to "lcat-leads" and restructure all logging in `assignToLeadInvestigation` to provide turn numbers, a summary of existing assignments, and per-lead explanations of why each lead was chosen.
todos:
  - id: rename-category
    content: Rename 'lead-investigation' to 'lcat-leads' in logCategories.ts (LOG_CATEGORIES key + LOG_CATEGORY_LIST entry)
    status: pending
  - id: restructure-selectLead
    content: Change selectLeadToInvestigate to return { lead, reason } with detailed rejection reasons for repeatable leads, remove old log.info calls inside it
    status: pending
  - id: add-existing-assignments-log
    content: Add helper to format existing lead assignments and log it at the start of assignToLeadInvestigation
    status: pending
  - id: add-per-lead-logs
    content: Track LeadAssignment[] throughout assignToLeadInvestigation and emit per-lead logs at the end, including piling reason
    status: pending
  - id: update-log-calls
    content: Replace all log.info('lead-investigation', ...) with log.info('lcat-leads', ...) and remove old summary log
    status: pending
  - id: verify
    content: Run qcheck to verify correctness
    status: pending
isProject: false
---

# Refactor lead investigation logs

## Part 1: Rename log category

Rename `'lead-investigation'` to `'lcat-leads'` in the log category system. Only the **log category** usages are renamed -- the `rand.set('lead-investigation', ...)` calls in `DebugSettingsCard.tsx`, `DebugCard.tsx`, `aiTestSetup.ts`, and `updateLeadInvestigations.ts` are random-seed keys and must NOT be changed.

### Files to change

- [web/src/lib/primitives/logCategories.ts](web/src/lib/primitives/logCategories.ts) -- rename key in `LOG_CATEGORIES` object and in `LOG_CATEGORY_LIST` array (2 occurrences).
- [web/src/ai/intellects/basic/leadInvestigation.ts](web/src/ai/intellects/basic/leadInvestigation.ts) -- update all 3 `log.info('lead-investigation', ...)` calls.

## Part 2: Restructure logging in `assignToLeadInvestigation`

All new logs use `'lcat-leads'` and include the turn number as a prefix: `Turn N: ...`.

### Log 1: Existing assignments summary

Emitted once at the beginning of the function (after early-return checks). Lists every active lead investigation and its agent count:

```
Turn 15: existing lead assignments: Criminal organizations: 2, Locate Red Dawn member (R): 3
```

If no active investigations: `Turn 15: existing lead assignments: none`

Implementation: iterate `gameState.leadInvestigations`, filter `state === 'Active'`, look up each lead via `dataTables.leads`, format `lead.name + (R if repeatable) + : agentCount`.

### Log 2: Per-lead assignment logs (one per lead that received new agents)

For each lead that had at least one agent newly assigned in this turn, emit a log:

```
Turn 15: assigned 2 to Criminal organizations. why: non-repeatable lead chosen at random
Turn 15: assigned 3 to Locate Red Dawn member (R). why: <detailed reason>
```

The "why" depends on the selection path:

- **Non-repeatable lead**: `why: non-repeatable lead chosen at random`
- **Piling onto existing repeatable investigation**: `why: piling onto existing repeatable investigation`
- **Newly selected repeatable lead**: emit a succinct summary. If other repeatable leads were considered but rejected, list them with the **first** constraint that failed (from `DeploymentFeasibilityResult.reason` + numeric details). Example:

```
Turn 15: assigned 1 to Locate Red Dawn member (R). why: repeatable lead selected. Following repeatable leads were not selected as resulting missions could not be deployed successfully: Locate Exalt safehouse (R) - not enough transport cap (needed 10 vs available 6), Locate Black Lotus member (R) - not enough agent CR (needed 100.00 vs available 80.00)
```

The failure reason is derived from the `DeploymentFeasibilityResult` discriminated union returned by `canDeployMissionWithCurrentResources`:

- `insufficientAgentCount` -> `not enough agents (needed N vs available M)`
- `insufficientCombatRating` -> `not enough agent CR (needed X vs available Y)`
- `insufficientTransport` -> `not enough transport cap (needed N vs available M)`

Only the first failing constraint is listed per lead (the function already returns on the first failure).

If no other leads were rejected (i.e., the selected lead was the only candidate or the top-priority deployable): `why: repeatable lead selected (highest priority deployable)`

### Code design changes in [leadInvestigation.ts](web/src/ai/intellects/basic/leadInvestigation.ts)

1. **New type** for tracking assignments made this turn:

```typescript
type LeadAssignment = {
  lead: Lead
  agentCount: number
  reason: string
}
```

1. **Change `selectLeadToInvestigate` return type** from `Lead | undefined` to `{ lead: Lead; reason: string } | undefined`. Inside the repeatable-lead selection path, accumulate a list of `{ leadName: string, failureReason: string }` for each lead whose `canDeployMissionWithCurrentResources` returned `canDeploy: false`. Format the failure reason from `DeploymentFeasibilityResult` into a succinct string like `not enough transport cap (needed 10 vs available 6)`. Build the final reason string from these rejections. Remove the existing `log.info(...)` calls inside `selectLeadToInvestigate` (they are replaced by the reason string).
2. **Track assignments** in `assignToLeadInvestigation`: maintain a `leadAssignments: LeadAssignment[]` array. After each lead selection + agent assignment, push an entry. For piling, accumulate into a single entry. For the piling-onto-existing-repeatable path (lines 80-111), set reason to `"piling onto existing repeatable investigation"`.
3. **Emit logs** at the end of the function: first the "existing assignments" log, then one log per entry in `leadAssignments`. Remove the 3 existing `log.info(...)` calls (lines 177, 250-256, 263-268).
4. **Capture existing assignments state** before the loop starts (so the "existing assignments" log reflects the state *before* any new assignments are made in this turn). Use a helper function `formatExistingAssignments(gameState: GameState): string`.
