# Intel and Leads System Refactor

## Overview

Transform the intel system from global intel spending to per-lead intel accumulation with decay and
probabilistic completion. Agents investigate specific leads over time, accumulating
intel that increases success chance per turn.

## Key Changes

### 1. Data Model Changes

**GameState changes:**

- Keep global `intel: number` field (unused for leads, kept for backward compatibility)
- Add `leadInvestigations: Record<string, LeadInvestigation>` to track ongoing investigations
- Keep `leadInvestigationCounts` for completed investigations (used for faction discovery)

**New types:**

- `LeadInvestigation` with fields:
- `id: string` (unique investigation ID)
- `leadId: string`
- `accumulatedIntel: number`
- `agentIds: string[]` (agents currently investigating this lead)
- `turnsInvestigated: number` (how long investigation has been ongoing)

**Agent assignment changes:**

- Add new assignment type: `LeadInvestigationId` (with id of e.g., `'investigation-001'`)
- Agents assigned to investigation enter `InTransit` → `OnAssignment` state
- Multiple agents can investigate same lead simultaneously (via same investigation or different ones)
- Multiple leads can be investigated simultaneously

**Lead model updates:**

- Remove `intelCost: number` (no longer instant purchase)
- Add `difficultyConstant: number` (C factor in basis points, e.g., C=100 means 1 intel = 1% success chance)
- Add `enemyEstimate?: string` (for observability, e.g., "Expect safehouse to have a dozen low-ranked cult members")

**Constants:**

- Add `INTEL_DECAY: Bps` = 10 bps (0.1% decay per intel point)
- Add `MAX_INTEL_DECAY: Bps` = bps(5000) (hard cap on decay: 50%)

### 2. Lead Investigation Mechanics

**Creating investigations:**

- Player selects lead + agents, clicks "Investigate lead"
- Creates new `LeadInvestigation` entity with unique ID
- Agents assigned to investigation ID enter `InTransit` → `OnAssignment`
- Investigation tracks: leadId, accumulatedIntel (starts at 0), agentIds, turnsInvestigated (starts at 0)

**Intel accumulation:**

- Each turn, agents investigating a lead generate intel based on their skill
- Formula: same as in `getEspionageIntel`
- Total intel accumulated per turn = sum of all agents' contributions in that investigation

**Intel decay:**

- Applied each turn before new intel gathering
- Formula: `intelDecay = min(bps(gatheredIntel * INTEL_DECAY.value), MAX_INTEL_DECAY)`
- Example: 100 intel → 10% decay (10 bps = 10 intel lost), 500 intel → 50% decay (5000 bps = 50% = 250 intel lost, capped)
- Decay amount: `decayedIntel = gatheredIntel * intelDecay.value / 10000`
- After decay: `gatheredIntel = gatheredIntel - decayedIntel`

**Success chance:**

- Calculated each turn: `successChance = bps(gatheredIntel * lead.difficultyConstant)`
- Example: 50 intel with C=100 → 5000 bps (50% chance), 50 intel with C=50 → 2500 bps (25% chance)
- Roll success check each turn (random 1-10000 vs successChance.value)
- On success: lead completes, creates mission sites (like current `investigateLead`),
increments `leadInvestigationCounts`, investigation is removed.

**Espionage assignment:**

- Keep `Espionage` assignment for agents
- Global intel still gathers from espionage agents
- Global intel is not used for lead investigation (kept for backward compatibility/future use)

### 3. Turn Advancement Updates

**New step in `evaluateTurn.ts`:**

- After step 6 (espionage), add step 6.5: "Update lead investigations"
- For each active `LeadInvestigation`:
- Apply intel decay (before accumulation)
- Accumulate new intel from assigned agents
- Increment `turnsInvestigated`
- Calculate success chance using `lead.difficultyConstant`
- Roll for completion using `rollAgainstProbability` with `successChance`
- If successful:
- Complete lead: increment `leadInvestigationCounts[leadId]`
- Create mission sites (same logic as current `investigateLead`)
- Remove investigation from `leadInvestigations`
- Update agent assignments (agents return to Available/Standby)

**Remove from `updatePlayerAssets`:**

- Keep global intel tracking (still gathers from espionage)
- Global intel no longer spent on leads

### 4. UI Changes

**PlayerActions.tsx:**

- Keep "Investigate lead" button, update its functionality to create new investigation entity
- Requires both lead selection AND agent selection
- Creates new investigation entity
- Keep "Recall agents" button, which now will also recall agents from lead investigation if they are assigned to it
- **Important:** When all agents are recalled from an investigation, the entire investigation is removed (accumulated intel is lost)

**LeadCards.tsx:**

- Keep lead discovery/unlock logic
- Display enemy estimates from lead description (if available)

**SituationReportCard.tsx:**

- Add new data grid section for lead investigations
- One row per active lead investigation
- Columns: Lead ID, Agents assigned count, accumulated intel, Success chance (in percentage)
- Display below existing panic section, but above factions

**AssetsDataGrid.tsx:**

- Keep global intel display (still accumulates from espionage)

### 5. Migration & Backward Compatibility

**State migration:**

- Keep existing `intel` as-is (no conversion needed)
- Initialize `leadInvestigations` as empty object `{}`
- Existing `leadInvestigationCounts` remains unchanged
- No data loss, fully backward compatible

### 6. Files to Modify

**Model:**

- `web/src/lib/model/model.ts` - Add `LeadInvestigation` type, update `GameState`, `Lead`, `AgentAssignment`
- `web/src/lib/collections/leads.ts` - Update lead definitions: add `difficultyConstant`, `enemyEstimate`, remove `intelCost`

**Reducers:**

- `web/src/lib/slices/reducers/leadReducers.ts` - Add `createLeadInvestigation`, `recallAgentsFromInvestigation`,
remove old `investigateLead` logic
- `recallAgentsFromInvestigation` must remove the investigation entirely if all agents are recalled
- `web/src/lib/slices/reducers/agentReducers.ts` - Update agent assignment handling for lead investigation assignments

**Turn advancement:**

- `web/src/lib/turn_advancement/evaluateTurn.ts` - Add lead investigation update step (after `updateEspionageAgents`)
- `web/src/lib/turn_advancement/updateAgents.ts` - Keep espionage update (still generates global intel)
- Create `web/src/lib/turn_advancement/updateLeadInvestigations.ts` - New file for lead investigation logic:
- `updateLeadInvestigations(state: GameState): LeadInvestigationReport[]`
- Handles decay, accumulation, success rolls, completion

**Ruleset:**

- `web/src/lib/model/ruleset/ruleset.ts` - Add functions:
- `calculateIntelDecayPercent(accumulatedIntel: number): number`
- `calculateLeadSuccessChance(accumulatedIntel: number, difficultyConstant: number): number`
- `web/src/lib/model/ruleset/constants.ts` - Add `INTEL_DECAY: Bps = bps(10)`, `MAX_INTEL_DECAY: Bps = bps(5000)`

**UI:**

- `web/src/components/PlayerActions.tsx` - Update lead investigation UI (requires lead + agents selection)
- `web/src/components/LeadCards.tsx` - Display investigations with intel, success chance, agents, enemy estimates
- `web/src/components/AssetsDataGrid.tsx` - Keep global intel display

**Selectors/Views:**

- Update `AgentsView` to support lead investigation assignment queries
- Create helper functions to get investigations by leadId, get agents by investigationId

**Turn Report:**

- `web/src/lib/model/turnReportModel.ts` - Add `LeadInvestigationReport` type for reporting investigation updates

### 7. Testing

- Update existing tests that use global intel spending
- No other changes for now.

## Implementation Order

1. Data model changes (types, GameState, Lead updates)
2. Constants (decay increase, max decay)
3. Ruleset functions (decay calculation, success chance)
4. Lead investigation update logic (decay, accumulation, completion)
5. Agent assignment reducers (create investigation, recall agents)
6. Turn advancement integration
7. UI updates (PlayerActions, LeadCards)
8. Tests

## Implementation Details

**Investigation ID generation:**

- Use format: `investigation-${numericId}` where numericId is next available number
- Similar to mission site ID generation

**Agent assignment:**

- When agents assigned to investigation, their `assignment` becomes the investigation ID
- State transitions: `Available` → `InTransit` → `OnAssignment`
- When investigation completes or agents recalled, agents return to `Available` with `Standby` assignment
- **Important:** If all agents are recalled from an investigation, the investigation is removed entirely (disappears)
- Accumulated intel is lost
- Investigation entity is deleted from `leadInvestigations`

**Success roll:**

- Use `rollAgainstProbability` with `successChancePercent`
- If success, lead completes

### To-dos

- [ ] Update data model: Add LeadInvestigation type, update GameState, Lead, and AgentAssignment types
- [ ] Update lead definitions: Add difficulty constants and enemy estimates, remove intelCost
- [ ] Create updateLeadInvestigations.ts: Implement intel accumulation, decay, and success chance calculation
- [ ] Create assignAgentsToLead reducer and update agent assignment handling
- [ ] Integrate lead investigation updates into evaluateTurn.ts turn advancement flow
- [ ] Update PlayerActions.tsx: Replace instant investigate with assign agents to lead
- [ ] Update LeadCards.tsx: Display intel, success chance, assigned agents, enemy estimates
- [ ] Create state migration logic for existing intel and leadInvestigationCounts
- [ ] Update and add tests for new intel and lead investigation mechanics