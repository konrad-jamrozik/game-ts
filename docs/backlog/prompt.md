# Prompt

// KJA current work

Refactor the manageAgents of basicIntellect.ts to be more efficient and simpler.

Specifically:

- All the relevant agents should be queries once at the beginning. So no multiple calls to selectNextBestReadyAgents,
  but instead at once a list of all the agents from game state, and allocate them appropriately to various assignments,
  like contracting, mission deployments, training, lead investigations, etc.
- This means you can no longer do `while (currentIncome < targetIncome) selectNextBestReadyAgents(...)` to figure out
  how many more agents to assign. You just need to call `estimateAgentContractingIncome` ahead of time on all the relevant
  agents and then select the relevant agents and assign them appropriately.

This is the current implementation:

``` typescript
export function manageAgents(api: PlayTurnAPI): void {
  unassignExhaustedAgents(api)
  assignToContractingWithPriority(api)
  deployToMissions(api)
  assignToContracting(api)
  assignToLeadInvestigation(api)
  assignToTraining(api)
  assignLeftoverToContracting(api)
}
```

It should be refactored so that after `unassignExhaustedAgents(api)` the list of all agents is obtained,
their stats computed (like `estimateAgentContractingIncome`), and then passed to each function, so it will look
similar to this:

``` typescript
export function manageAgents(api: PlayTurnAPI): void {
  unassignExhaustedAgents(api)
  let remAgents = getAliveAgentsAndCComputeExtraStats(api)
  remAgents = assignToContractingWithPriority(api, remAgents)
  remAgents = deployToMissions(api, remAgents)
  remAgents = assignToContracting(api, remAgents)
  remAgents = assignToLeadInvestigation(api, remAgents)
  remAgents = assignToTraining(api, remAgents)
  remAgents = assignLeftoverToContracting(api, remAgents)
}
```

Where:
- each functions returns `remAgents` i.e. agents that have not been assigned by the function.
- `remAgents` is a list of Agent with extra stats required to make right decisions, like `estimateAgentContractingIncome`,

Besides this refactoring, try to maintain the same agent assignment logic as before.
