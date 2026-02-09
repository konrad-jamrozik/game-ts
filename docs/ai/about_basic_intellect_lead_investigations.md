# About basic AI intellect lead investigations logic

This document specifies how basic AI intellect decides which leads to investigate in a given turn.

# Lead investigation assignment overall approach

Lead investigations are the AI's intelligence pipeline: completing an investigation on a lead
unlocks new missions to deploy agents to. The AI dedicates a small, scaling portion of its
workforce to investigations (`1 + floor(totalAgents / 10)` agents).

There are two kinds of leads: **non-repeatable** (one-time progression leads) and **repeatable**
(recurring sources of missions). Non-repeatable leads are always prioritized, since they advance
the game's progression. When only repeatable leads remain, the AI is selective -- it only
investigates leads whose dependent missions it could actually deploy with current resources (enough
agents, combat rating, and transport capacity). This avoids wasting agents on investigations that
won't produce actionable missions.

Once a repeatable lead is selected, all remaining investigation agents are **piled onto it** in a
single batch, concentrating effort to complete the investigation as quickly as possible rather than
spreading agents across multiple leads. This piling persists across turns: if a repeatable
investigation is already active from a previous turn, new agents continue to pile onto it.

For non-repeatable leads, agents are assigned proportionally to the lead's difficulty
(`ceil(difficulty / 8)`), ensuring harder leads get more agents without overcommitting.

## The non-repeatable lead agent count assignment heuristic

The divisor of 8 is a heuristic that keeps investigation timelines reasonable across difficulty levels.
For example, a difficulty-40 lead gets `ceil(40 / 8) = 5` agents. With 5 skill-100 agents, the
team produces roughly `5^0.8 × 10 ≈ 36` Intel per turn initially (due to diminishing returns from
the team-size exponent), against an effective difficulty of `40 × 100 = 4,000` Intel needed for
100% success probability. Since success is checked probabilistically each turn (see
`about_lead_investigations.md`), the investigation can complete well before reaching 100% -- but
the 5-agent team ensures probability builds up fast enough that completion within a moderate number
of turns is likely. A single agent on that same lead would produce only 10 Intel/turn, making
progress far too slow.

# Lead investigation assignment algorithm

In the `assignToLeadInvestigation()` function the AI assigns agents to lead investigations. It first computes how many
agents should be investigating (via `computeTargetAgentCountForInvestigation()`), subtracts the agents already
investigating (via `countAgentsInvestigatingLeads()`), and then assigns the remaining needed agents in a loop.

Available leads are obtained via `getAvailableLeads()`, which uses `getAvailableLeadsForInvestigation()` from shared
logic and additionally filters out the deep state lead (AI-specific exclusion).

## Target agent count

The `computeTargetAgentCountForInvestigation()` function determines how many agents should be investigating leads:
at least 1 agent, plus 1 extra for each 10 agents the player has in total. Formally: `1 + floor(totalAgents / 10)`.

## Main assignment loop

The main loop in `assignToLeadInvestigation()` iterates up to `agentsToAssign` times (the difference between target
and current investigating agents). On each iteration:

- If a repeatable lead has already been selected (either from a previous iteration in this turn, or detected as an
  existing active repeatable investigation from a previous turn), batch-select and pile all remaining agents onto that
  same investigation, then exit the loop. If the investigation was completed or abandoned in the meantime, stop.
- Otherwise, call `selectLeadToInvestigate()` to pick a lead:
  - If no lead is selected (e.g., no deployable repeatable leads), stop.
  - If the selected lead is repeatable, mark it for piling in subsequent iterations.
  - For non-repeatable leads: assign `ceil(difficulty / NON_REPEATABLE_LEAD_DIFFICULTY_DIVISOR)` agents at once
    (where `NON_REPEATABLE_LEAD_DIFFICULTY_DIVISOR` is 8), minus agents already on that lead's active investigation.
  - For repeatable leads: assign 1 agent (piling happens in subsequent iterations).
  - If the lead already has an active investigation, add agents to it. Otherwise, start a new investigation.

## Lead selection algorithm

The `selectLeadToInvestigate()` function decides which lead to investigate:

- Prioritize non-repeatable leads over repeatable leads. If there are multiple non-repeatable leads, pick at random.
- If there are only repeatable leads, use the following smart selection:
  1. For each repeatable lead, compute its mission combat rating via `getMissionCombatRatingForLead()`, which finds all
     dependent offensive missions and returns the maximum combat rating among them.
  2. Sort repeatable leads by mission combat rating in descending order (hardest missions first).
  3. For each lead (in sorted order), check if any of its dependent missions could be deployed successfully with
     current resources by calling `canDeployMissionWithCurrentResources()`. This checks agent count, combat rating
     (with a `TARGET_COMBAT_RATING_MULTIPLIER` of 1.2), and transport capacity. Collect all leads that have at least
     one deployable dependent mission.
  4. If no leads would result in deployable missions, return `undefined` (skip investigation entirely).
  5. Among deployable leads, select those with the maximum combat rating.
  6. If multiple leads tie on combat rating, select the lead(s) with the fewest successful investigations
     (using `leadInvestigationCounts`).
  7. If multiple leads still tie, pick at random.

## Agent selection

Agents are selected via `selectNextBestReadyAgents()` with `includeInTraining: true`, meaning agents currently
in training can be pulled out and assigned to investigations. The function prioritizes available agents first,
falling back to in-training agents only when no available agents remain. Among candidates, it picks the agent
with the lowest exhaustion (at most `MAX_READY_EXHAUSTION_PCT` of 5%), picking randomly among ties. A 20%
(`AGENT_RESERVE_PCT`) agent reserve is maintained by default.

```typescript
function assignToLeadInvestigation() {
  let availableLeads = getAvailableLeads()
  if (availableLeads is empty):
    return

  let targetAgentCount = computeTargetAgentCountForInvestigation()
  let currentAgentCount = countAgentsInvestigatingLeads()
  let agentsToAssign = targetAgentCount - currentAgentCount
  let repeatableLeadSelected = undefined

  for (i in 1..agentsToAssign):
    // Check for existing active repeatable investigation from a previous turn
    if (repeatableLeadSelected is undefined):
      let existingRepeatableInv = find active investigation on a repeatable lead
      if (existingRepeatableInv exists):
        repeatableLeadSelected = existingRepeatableInv.lead

    if (repeatableLeadSelected is defined):
      // Batch-pile all remaining agents onto the repeatable lead
      let existingInv = findActiveInvestigation(repeatableLeadSelected)
      if (existingInv is undefined):
        break  // Investigation completed or abandoned

      let remainingAgents = selectNextBestReadyAgents(agentsToAssign - i)
      addAgentsToInvestigation(existingInv, remainingAgents)
      break  // All agents assigned in batch
    else:
      let lead = selectLeadToInvestigate(availableLeads)
      if (lead is undefined):
        break  // No deployable leads

      if (lead.repeatable):
        repeatableLeadSelected = lead

      // Determine how many agents to assign to this lead
      let currentAgentsOnLead = findActiveInvestigation(lead)?.agentIds.length ?? 0
      let agentsNeeded = lead.repeatable
        ? 1
        : max(1, ceil(lead.difficulty / NON_REPEATABLE_LEAD_DIFFICULTY_DIVISOR) - currentAgentsOnLead)

      let agents = selectNextBestReadyAgents(agentsNeeded)
      assignAgentsToLead(agents, lead)

      // Adjust loop counter for batch assignment
      if (!lead.repeatable and agents.length > 1):
        i += agents.length - 1
}

function selectLeadToInvestigate(availableLeads) {
  let nonRepeatableLeads = availableLeads.filter(lead => !lead.repeatable)
  if (nonRepeatableLeads.length > 0):
    return pickAtRandom(nonRepeatableLeads)

  // Smart selection for repeatable leads
  let leadsWithCombatRating = repeatableLeads.map(lead => {
    lead, combatRating: getMissionCombatRatingForLead(lead)
  })
  let sortedLeads = leadsWithCombatRating.sortByDescending(combatRating)

  let deployableLeads = []
  for (each sortedLead):
    if (canDeployMissionWithCurrentResources(sortedLead.dependentMission)):
      deployableLeads.push(sortedLead)

  if (deployableLeads is empty):
    return undefined

  let maxCombatRating = max(deployableLeads.map(d => d.combatRating))
  let topLeads = deployableLeads.filter(d => d.combatRating == maxCombatRating)

  if (topLeads.length == 1):
    return topLeads[0]

  // Tiebreak by fewest successful investigations
  let minInvCount = min(topLeads.map(l => leadInvestigationCounts[l.id] ?? 0))
  let leastInvestigated = topLeads.filter(l => (leadInvestigationCounts[l.id] ?? 0) == minInvCount)
  return pickAtRandom(leastInvestigated)
}

function computeTargetAgentCountForInvestigation() {
  return 1 + Math.floor(totalAgentCount / 10)
}
```
