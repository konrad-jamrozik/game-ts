
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

- Ensure that income from agent contracting covers between 100% and 120% upkeep costs.
  - Notably, this doesn't take into account any money coming from funding, nor it takes
    into account discrete expenses like hiring agents or buying capability upgrade.
- Ensure that agents have no exhaustion, or as little exhaustion as possible, when being
  assigned or deployed.
- Ensure that when deploying agents on a mission, the sum total of agent threat assessment
  is at least as high as the enemy threat assessment.
  - Ensure there is enough transport capacity to deploy at least one such mission per turn
- Ensure there is at least one lead always being investigated, by 1 agent.
- Ensure there is at least enough money available so that the player won't run out of money
  within next 3 turns, assuming that the contracting income would cover only 50% of upkeep costs.
- Ensure any remaining agents are not idling; all ready agents should be in training.
  - As such, ensure there is enough training capacity available.
- Ensure the player can face the ever-increasing frequency and threat level of defensive missions,
  plus that it can make progress and win offensive missions:
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

  // Ensure income covers upkeep costs (100-120% target)
  assignToContracting()              // See "Assignment to contracting"

  // Ensure at least one lead is being investigated
  assignToLeadInvestigation()        // See "Lead investigation"

  // Assign remaining idle agents to training
  assignToTraining()                 // See "Assignment to training"

  // Assign remaining idle agents to contracting
  assignLeftoverToContracting()      // See "Assignment to contracting"
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
    if (agent.exhaustion > exhaustionThreshold):
      unassignAgent(agent)  // Agent will recover while idle
}
```

Exhausted agents perform poorly and should recover before being reassigned.
The threshold determines when an agent is too exhausted to be effective.

## Mission deployment

``` typescript
function deployToMissions() {
  // Handle defensive missions first (mandatory)
  let defensiveMissions = getDefensiveMissionsNearExpiry()
  for (mission in defensiveMissions):
    deployToMission(mission)

  // Then offensive missions if resources allow
  let offensiveMissions = getOffensiveMissions()
  for (mission in offensiveMissions):
    if (hasSpareAgentsForOffensive()):
      deployToMission(mission)
}

function deployToMission(mission) {
  let requiredThreat = mission.enemyThreatAssessment
  let agents = selectAgentsForMission(requiredThreat)
  if (sumThreat(agents) >= requiredThreat) and (hasTransportCapacity(agents)):
    deployAgents(agents, mission)
}
```

Agent selection for missions ensures:
- Total agent threat meets or exceeds enemy threat.
- Agents are not exhausted.
- Transport capacity is available.

## Assignment to contracting

``` typescript
function assignToContracting() {
  let perTurnCosts = calculatePerTurnCosts()
  let targetIncome = perTurnCosts * 1.1  // Target 110% of costs (middle of 100-120% range)
  let currentIncome = calculateContractingIncome()

  while (currentIncome < targetIncome):
    let agent = selectBestAgentForContracting()
    if (agent is null):
      break
    assignAgentToContracting(agent)
    currentIncome = calculateContractingIncome()
}
```

Agents are selected for contracting based on:
- Being ready (not exhausted, not deployed, not recovering).
- Not being needed for imminent mission deployment.

## Lead investigation

``` typescript
function assignToLeadInvestigation() {
  if (countAgentsInvestigatingLeads() >= 1):
    return  // Goal: at least 1 agent investigating

  let availableLeads = getAvailableLeads()
  if (availableLeads is empty):
    return

  let lead = selectLeadToInvestigate(availableLeads)
  let agent = selectBestAgentForInvestigation()
  if (agent is not null):
    assignAgentToLead(agent, lead)
}
```

Lead selection prioritizes leads that spawn defensive missions,
as these are mandatory to handle.

## Assignment to training

``` typescript
function assignToTraining() {
  let idleAgents = getIdleReadyAgents()
  let availableTrainingSlots = trainingCapacity - countAgentsInTraining()

  for (agent in idleAgents):
    if (availableTrainingSlots <= 0):
      break
    assignAgentToTraining(agent)
    availableTrainingSlots -= 1
}
```

All idle agents should be training. This ensures continuous skill improvement
and that no agents are wasted sitting idle.

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
1. If agent count is below desired count: hire an agent (or upgrade agent cap if at capacity)
2. If transport capacity is below 50% of desired agent count: upgrade transport capacity
3. If training capacity is below 60% of desired agent count: upgrade training capacity
4. If any agent effectiveness capability is below desired level: upgrade the first one that's below
   (weapon damage, then training skill gain, then exhaustion recovery, then hit points recovery)

Desired values:
- Desired agent count: 4 + floor((turn number - 1) / 4)
- Desired transport capacity: 50% of desired agent count
- Desired training capacity: 60% of desired agent count
- Desired capability levels: 1 upgrade per 10 turns (each capability independently)

``` typescript
function computeNextBuyPriority() {
  // Priority 1: Buy agents until desired agent count is reached
  if (shouldBuyAgent()):
    if (canHireAgent()):
      return { type: "hireAgent" }
    else:
      return { type: "upgradeAgentCap" }
  
  // Priority 2: Buy transport capacity until desired transport capacity is reached
  if (shouldBuyTransportCapacity()):
    return { type: "upgradeTransportCapacity" }
  
  // Priority 3: Buy training capacity until desired training capacity is reached
  if (shouldBuyTrainingCapacity()):
    return { type: "upgradeTrainingCapacity" }
  
  // Priority 4: Buy agent effectiveness capabilities until desired agent effectiveness is reached
  if (shouldBuyWeaponDamage()):
    return { type: "upgradeWeaponDamage" }
  if (shouldBuyTrainingSkillGain()):
    return { type: "upgradeTrainingSkillGain" }
  if (shouldBuyExhaustionRecovery()):
    return { type: "upgradeExhaustionRecovery" }
  if (shouldBuyHitPointsRecovery()):
    return { type: "upgradeHitPointsRecovery" }
  
  return undefined  // Nothing to buy
}

function shouldBuyAgent() {
  let desiredAgentCount = computeDesiredAgentCount()
  let actualAgentCount = countAgents()
  return actualAgentCount < desiredAgentCount
}

function canHireAgent() {
  let currentAgentCount = countAgents()
  let agentCap = getAgentCap()
  return currentAgentCount < agentCap
}

function computeDesiredAgentCount() {
  let turnNumber = getCurrentTurnNumber()
  return 4 + Math.floor((turnNumber - 1) / 4)
}

function shouldBuyTransportCapacity() {
  let desiredAgentCount = computeDesiredAgentCount()
  let desiredTransportCapacity = Math.floor(desiredAgentCount * 0.5)
  let actualTransportCapacity = getTransportCapacity()
  return actualTransportCapacity < desiredTransportCapacity
}

function shouldBuyTrainingCapacity() {
  let desiredAgentCount = computeDesiredAgentCount()
  let desiredTrainingCapacity = Math.floor(desiredAgentCount * 0.6)
  let actualTrainingCapacity = getTrainingCapacity()
  return actualTrainingCapacity < desiredTrainingCapacity
}

function shouldBuyWeaponDamage() {
  let desiredLevel = computeDesiredWeaponDamageLevel()
  let actualLevel = getWeaponDamageLevel()
  return actualLevel < desiredLevel
}

function shouldBuyTrainingSkillGain() {
  let desiredLevel = computeDesiredTrainingSkillGainLevel()
  let actualLevel = getTrainingSkillGainLevel()
  return actualLevel < desiredLevel
}

function shouldBuyExhaustionRecovery() {
  let desiredLevel = computeDesiredExhaustionRecoveryLevel()
  let actualLevel = getExhaustionRecoveryLevel()
  return actualLevel < desiredLevel
}

function shouldBuyHitPointsRecovery() {
  let desiredLevel = computeDesiredHitPointsRecoveryLevel()
  let actualLevel = getHitPointsRecoveryLevel()
  return actualLevel < desiredLevel
}

function computeDesiredWeaponDamageLevel() {
  let turnNumber = getCurrentTurnNumber()
  return Math.floor(turnNumber / 10)
}

function computeDesiredTrainingSkillGainLevel() {
  let turnNumber = getCurrentTurnNumber()
  return Math.floor(turnNumber / 10)
}

function computeDesiredExhaustionRecoveryLevel() {
  let turnNumber = getCurrentTurnNumber()
  return Math.floor(turnNumber / 10)
}

function computeDesiredHitPointsRecoveryLevel() {
  let turnNumber = getCurrentTurnNumber()
  return Math.floor(turnNumber / 10)
}
```

# Future work

- Smarter selection of which capabilities to upgrade.
- Smarter selection of which agents to assign to what, based on their skill level.
  (higher skill means better threat level for mission deployment but also better efficiency
  in assignments).
- Smarter selection of which leads to investigate and how many.
  - Specifically, decision on if to investigate leads that spawn offensive missions.
- Smarter assignment of agents to lead investigations, to make good forward progress.
