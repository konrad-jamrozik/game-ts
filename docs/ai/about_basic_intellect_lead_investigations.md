# About basic AI intellect lead investigations logic

This document specifies how basic AI intellect decides which leads to investigate in a given turn.

Implemented in: `assignToLeadInvestigation()`

The player assigns agents to lead investigations as follows:

- If there are no agents that can investigate leads, or no leads that can be investigated, do nothing.
- Decide how many and which agents to assign to investigate leads
- Assign these agents to investigate the leads.

How to decide which leads to investigate:
- Prioritize non-repeatable leads over repeatable leads.
- If there are multiple non-repeatable leads, pick at random.
- If there are multiple repeatable leads, pick at random.

How to decide how many agents to assign to investigate leads:
- At least one agent, and one extra for each 10 agents player has in total.

How to pick the next best agent to investigate leads:
- Prioritize ready agents (available or in training) with the lowest exhaustion level.
- Do not assign agents that have exhaustion of 5% or above.
- If multiple agents have the same exhaustion, one is picked at random.

``` typescript
function assignToLeadInvestigation() {
  let availableLeads = getAvailableLeads()
  if (availableLeads is empty):
    return

  let targetAgentCount = computeTargetAgentCountForInvestigation()
  let currentAgentCount = countAgentsInvestigatingLeads()
  let agentsToAssign = targetAgentCount - currentAgentCount

  for (i in 1..agentsToAssign):
    let lead = selectLeadToInvestigate(availableLeads)
    if (lead is undefined):
      break  // No more leads to investigate
    
    let agent = selectNextBestReadyAgent()  // See "Selecting next best ready agent"
    if (agent is undefined):
      break  // No more agents available
    
    assignAgentToLead(agent, lead)
}

function computeTargetAgentCountForInvestigation() {
  let totalAgentCount = countAgents()
  // At least 1 agent, plus 1 extra for each 10 agents
  return 1 + Math.floor(totalAgentCount / 10)
}

function selectLeadToInvestigate(availableLeads) {
  // Prioritize non-repeatable leads over repeatable leads
  let nonRepeatableLeads = availableLeads.filter(lead => !lead.isRepeatable)
  if (nonRepeatableLeads.length > 0):
    return pickAtRandom(nonRepeatableLeads)
  
  // If no non-repeatable leads, pick from repeatable leads
  return pickAtRandom(availableLeads)
}
```
