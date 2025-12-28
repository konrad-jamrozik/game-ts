---
name: Priority Contracting Function
overview: Add `assignToContractingWithPriority` function to `basicIntellect.ts` that assigns agents to contracting before missions are deployed, ensuring projected income stays non-negative. Unlike existing functions, this will assign agents regardless of their exhaustion level.
todos:
  - id: add-priority-contracting
    content: Add assignToContractingWithPriority function and helper to basicIntellect.ts
    status: pending
  - id: update-manage-agents
    content: Update manageAgents to call new function before deployToMissions
    status: pending
---

# Add Priority Contracting Assignment

## Context

The AI player currently assigns agents in this order:

1. Unassign exhausted agents
2. Deploy to missions
3. Assign to contracting
4. Assign to lead investigation
5. Assign to training
6. Assign leftover to contracting

This can result in negative projected income if too many agents are deployed to missions before ensuring sufficient contracting coverage.

## Implementation

Modify [`web/src/ai/intellects/basicIntellect.ts`](web/src/ai/intellects/basicIntellect.ts):

### 1. Update `manageAgents` to call new function

```typescript
function manageAgents(api: PlayTurnAPI): void {
  unassignExhaustedAgents(api)
  assignToContractingWithPriority(api)  // NEW: Before deployToMissions
  deployToMissions(api)
  assignToContracting(api)
  assignToLeadInvestigation(api)
  assignToTraining(api)
  assignLeftoverToContracting(api)
}
```



### 2. Add `assignToContractingWithPriority` function

This function will:

- Calculate projected income using `getMoneyTurnDiff` from `moneyRuleset.ts`
- If projected income is negative, assign agents to contracting until it reaches 0
- Use a new selection function that does NOT require agents to be "ready" (can assign agents with exhaustion >= 5%)
- Log the outcome

### 3. Add `selectNextAgentForPriorityContracting` helper

Unlike `selectNextBestReadyAgent` which filters to agents with exhaustion < 5%, this helper:

- Selects agents from Standby or Training assignments (in-base agents)
- Does NOT filter by exhaustion level
- Still prefers agents with lower exhaustion (via `pickAtRandomFromLowestExhaustion`)
- Excludes already-selected agents

## Key Formulas

From [`web/src/lib/ruleset/moneyRuleset.ts`](web/src/lib/ruleset/moneyRuleset.ts):

```typescript
// Projected income per turn
projectedIncome = funding + contractingIncome - agentUpkeep

```