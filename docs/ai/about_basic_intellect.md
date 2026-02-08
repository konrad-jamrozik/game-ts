
# Basic AI player intellect

# Key decisions

On a high level, the basic AI player intellect strives to answer following questions,
and decide based on the answers:

- What to spend money on, if at all?
  - How many agents to hire?
  - Which capacities to upgrade?
  - Which agent capabilities to upgrade?

- What to do with agents?
  - How many and which agents to assign to:
    - Contracting?
    - Training?
    - Lead investigations?
      - Which leads to investigate?
  - How many and which agents to deploy on a mission?
    - Which missions to deploy to?
    - When to deploy? (missions expire)
    - Which agents and how many to deploy?

# Goals

The player aims to make the key decision described above by following a set of goals, listed below.
Not all of the goals can be always achieved at the same time, and as such the player must prioritize,
which is elaborated in further sections.

- Ensure that income from agent contracting covers 120% of upkeep costs.
  - Notably, this doesn't take into account any money coming from funding, nor it takes
    into account discrete expenses like hiring agents or buying capability upgrade.
- Ensure that agents assigned or deployed have exhaustion below 5%.
  - If less than 20% of all agents are ready, do not assign or deploy agents.
- Ensure that when deploying agents on a mission, the sum total of agent threat assessment
  is at least 120% of the enemy threat assessment.
  - Prioritize missions by expiry time (earliest first), with HQ raids always chosen first.
  - Ensure there is enough transport capacity to deploy missions.
- Ensure leads are being investigated by a target number of agents: 1 + floor(total agents / 10).
  - Prioritize non-repeatable leads over repeatable leads.
- Ensure there is at least enough money available so that the player won't run out of money
  within next 5 turns, assuming that the contracting income would cover only 50% of upkeep costs.
- Ensure ready agents (with exhaustion <= 5%) are assigned to training when capacity allows.
  - As such, ensure there is enough training capacity available.
- Ensure leftover ready agents are assigned to contracting to maximize income.
- Ensure the player can face the ever-increasing frequency and threat level of missions:
  - Ensure there is enough agents available in total.
  - Ensure the capabilities improving agent effectiveness are adequately upgraded.
    - This includes: training skill gain, exhaustion recovery %, hit points recovery %, weapon base damage.

# Algorithm

The player follows the following algorithm when deciding what to do in given turn.
It effectively codifies how the player prioritizes the goals described above:

``` typescript
function playTurn() {
  manageAgents()                     // See "Agent management"
  spendMoney()                       // See "Money spending"
}

function manageAgents() {
  // Unassign agents that need recovery
  unassignExhaustedAgents()          // See "Unassignment"

  // Deploy to missions according to priority and feasibility
  deployToMissions()                 // See "Mission deployment"

  // Ensure income covers 120% of upkeep costs
  assignToContracting()              // See "Assignment to contracting"

  // Ensure at least one lead is being investigated
  assignToLeadInvestigation()        // See "Lead investigation"

  // Assign remaining ready agents to training
  assignToTraining()                 // See "Assignment to training"

  // Assign remaining ready agents to contracting
  assignLeftoverToContracting()      // See "Assignment of leftover agents to contracting"
}

function spendMoney() {
  while (hasSufficientMoney()):             // See "Money savings"
    let priority = computeNextBuyPriority() // See "Next buy priority"
    if (priority is not undefined and hasSufficientMoneyToBuy(priority)):
      buy(priority)
    else {
      break
    }
}
```

## Unassignment

``` typescript
function unassignExhaustedAgents() {
  for (agent in getAllAssignedAgents()):
    if (agent.exhaustion >= 30%):
      unassignAgent(agent)  // Agent will recover while ready
}
```

Exhausted agents perform poorly and should recover before being reassigned.
Agents with exhaustion of 30% or above are unassigned to allow them to recover.

## Mission deployment

The player deploys agents to missions by selecting the next best ready agents until the sum of agent threat levels
is at least 120% of the assessed enemy threat level.

Algorithm:
- If there is a mission where the enemy is raiding player HQ, deploy to that mission first
- Otherwise, prioritize missions by expiry time (earliest first)
- If multiple missions have the same expiry, pick one at random
- For each selected mission:
  - Select next best ready agents (see "Selecting next best ready agent") until agent threat sum >= 120% of enemy threat
  - Check that transport capacity is sufficient
  - Deploy agents to the mission
- Repeat until no more missions can be deployed (no more missions, insufficient transport capacity, or insufficient ready agents)

Note: There is no distinction in the selection process between offensive and defensive missions, except that HQ raids are always chosen first.

``` typescript
function deployToMissions() {
  while (true):
    let mission = selectNextMissionToDeploy()
    if (mission is undefined):
      break  // No more missions to deploy
    
    let deployed = deployToMission(mission)
    if (!deployed):
      break  // Cannot deploy more missions (insufficient resources)
}

function selectNextMissionToDeploy() {
  let availableMissions = getAvailableMissions()
  if (availableMissions is empty):
    return undefined
  
  // Special case: HQ raids are chosen first
  let hqRaidMissions = availableMissions.filter(mission => mission.isHQRaid)
  if (hqRaidMissions.length > 0):
    return pickAtRandom(hqRaidMissions)
  
  // Otherwise, prioritize by expiry time (earliest first)
  let sortedMissions = availableMissions.sort((a, b) => a.expiryTurn - b.expiryTurn)
  let earliestExpiry = sortedMissions[0].expiryTurn
  let missionsWithEarliestExpiry = sortedMissions.filter(mission => mission.expiryTurn === earliestExpiry)
  return pickAtRandom(missionsWithEarliestExpiry)
}

function deployToMission(mission) {
  let enemyThreat = mission.enemyThreatAssessment
  let targetThreat = enemyThreat * 1.2  // 120% of enemy threat
  let selectedAgents = []
  let currentThreat = 0
  
  // Select agents until we reach target threat
  while (currentThreat < targetThreat):
    let agent = selectNextBestReadyAgent()  // See "Selecting next best ready agent"
    if (agent is undefined):
      break  // No more agents available
    
    selectedAgents.push(agent)
    currentThreat += agent.threatAssessment
  
  // Check if we have enough threat and transport capacity
  if (currentThreat < targetThreat):
    return false  // Insufficient threat level
  
  if (!hasTransportCapacity(selectedAgents)):
    return false  // Insufficient transport capacity
  
  // Deploy agents
  deployAgents(selectedAgents, mission)
  return true
}
```

## Assignment to contracting

The player assigns agents to contracting to ensure that contracting income covers 120% of upkeep costs.
This provides a buffer above the minimum required coverage.

Algorithm:
- Calculate target income: `upkeep costs * 1.2`
- While current contracting income is below target:
  - Select the best available agent (ready agents with lowest exhaustion, picked randomly if tied)
    - Do not assign agents that have exhaustion of 5% or above.
  - Assign agent to contracting
  - Recalculate current income
- Stop when target is reached or no more ready agents are available

Agent selection prioritizes ready agents (available or in training) with the lowest exhaustion level.
Agents with exhaustion of 5% or above are excluded from consideration.
If multiple agents have the same exhaustion, one is picked at random.

``` typescript
function assignToContracting() {
  let upkeepCosts = calculateUpkeepCosts()
  let targetIncome = upkeepCosts * 1.2 // Target 120% of costs
  let currentIncome = calculateContractingIncome()

  while (currentIncome < targetIncome):
    let agent = selectNextBestReadyAgent()  // See "Selecting next best ready agent"
    if (agent is undefined):
      break
    assignAgentToContracting(agent)
    currentIncome = calculateContractingIncome()
}

```

## Lead investigation

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

## Assignment to training

The player assigns ready agents to training to ensure continuous skill improvement and that no agents are wasted sitting ready.

Algorithm:
- While training capacity is available:
  - Select the next best ready agent (see "Selecting next best ready agent")
  - If no agent is available, stop
  - Assign agent to training
  - Decrease available capacity

``` typescript
function assignToTraining() {
  let availableTrainingSlots = trainingCapacity - countAgentsInTraining()

  while (availableTrainingSlots > 0):
    let agent = selectNextBestReadyAgent()  // See "Selecting next best ready agent"
    if (agent is undefined):
      break
    assignAgentToTraining(agent)
    availableTrainingSlots -= 1
}
```

## Assignment of leftover agents to contracting

The player assigns leftover ready agents to contracting to ensure that no agents are wasted and to maximize income.

Algorithm:
- While there are leftover ready agents available:
  - Select the next best ready agent (see "Selecting next best ready agent")
  - If no agent is available, stop
  - Assign agent to contracting

Agent selection uses the unified selection function, which excludes agents with exhaustion of 5% or above, ensuring only agents in good condition are assigned to contracting.

``` typescript
function assignLeftoverToContracting() {
  while (true):
    let agent = selectNextBestReadyAgent()  // See "Selecting next best ready agent"
    if (agent is undefined):
      break
    assignAgentToContracting(agent)
}
```

## Selecting next best ready agent

The player uses a unified function to select the next best ready agent for any assignment.
This ensures consistent agent selection criteria across all assignment types.

Algorithm:
- Get all ready agents (available or in training)
- If less than 20% of all agents are ready, return no agent (undefined)
- Filter out agents with exhaustion of 5% or above
- Select the agent with the lowest exhaustion level
- If multiple agents have the same exhaustion, pick one at random

``` typescript
function selectNextBestReadyAgent() {
  // In base agents are Available or in training
  let inBaseAgents = getAvailableOrInTrainingAgents()
  let totalAgentCount = countAgents()
  // Return no agent (undefined) if less than 20% of all agents are ready
  if (inBaseAgents.length < totalAgentCount * 0.2):
    return undefined
  
  // Filter out agents with exhaustion >= 5%
  let readyAgents = inBaseAgents.filter(agent => agent.exhaustion < 0.05)
  // Pick agent with lowest exhaustion, randomly if tied
  let selectedAgent = pickAtRandomFromLowestExhaustion(readyAgents)
  return selectedAgent
}
```

## Money savings

The player is allowed to spend money only if they have enough money saved up to not run out of money
within the next 5 turns, assuming that only 50% of upkeep costs are covered by contracting income.

Algorithm:
- Calculate minimum required savings: `(upkeep costs * 0.5) * 5`
- Allow spending only if current money >= minimum required savings
- After each purchase, recalculate minimum required savings based on new upkeep costs
- If a purchase would bring money below the minimum, stop spending for the turn

Example: if upkeep costs are 300, then 50% is 150, and minimum savings is 150 * 5 = 750.
The player can spend only if they have at least 750 money. After spending, if upkeep costs increase
(e.g., from hiring agents), the minimum is recalculated immediately.

``` typescript
function hasSufficientMoney() {
  let minimumRequiredSavings = computeMinimumRequiredSavings()
  let currentMoney = getCurrentMoney()
  return currentMoney >= minimumRequiredSavings
}

function computeMinimumRequiredSavings() {
  let upkeepCosts = calculateUpkeepCosts()
  let uncoveredUpkeepCosts = upkeepCosts * 0.5  // Only 50% covered by contracting income
  let turnsToCover = 5
  return uncoveredUpkeepCosts * turnsToCover
}
```

## Next buy priority

When deciding what to buy, the player first computes the `next buy priority` item to buy,
and buys it if they can afford it. If they cannot, they stop buying anything
else in given turn. Instead, they will re-evaluate the next buy priority in the next turn.
If the same priority still remain top, then either player buys it or the process repeats.

The `next buy priority` is computed as follows:

Priority order (first matching condition determines what to buy):
1. If agent count is below desired count AND below agent cap: hire an agent
2. Otherwise, find the first upgrade where actual is below desired, checking in this order:
   - Agent cap upgrades
   - Transport cap upgrades
   - Training cap upgrades
   - Weapon damage upgrades
   - Training skill gain upgrades
   - Exhaustion recovery upgrades
   - Hit points recovery upgrades
   - Hit points upgrades

If all desired goals are met (no upgrade found where desired > actual), new desired goals are established:
- If transport capacity is below 50% of desired agent count: increase desired transport cap upgrades
- Else if training capacity is below 60% of desired agent count: increase desired training cap upgrades
- Else if desired agent count is within budget relative to purchased upgrades: increase desired agent count or agent cap
- Else: increase desired stat upgrades in round-robin order

After establishing new goals, the priority computation repeats to determine what to buy next.

Note: The desired values for each upgrade type are dynamically established based on what has been purchased,
not predetermined by turn number. This ensures the player balances hiring agents, expanding capacities,
and upgrading capabilities in response to current game state.
