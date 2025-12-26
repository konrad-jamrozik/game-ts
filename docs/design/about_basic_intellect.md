
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

- Ensure that income from agent contracting covers between 100% and 120% per-turn costs.
  - Notably, this doesn't take into account any money coming from funding, nor it takes
    into account discrete expenses like hiring agents or buying capability upgrade.
- Ensure that agents have no exhaustion, or as little exhaustion as possible, when being
  assigned or deployed.
- Ensure that when deploying agents on a mission, the sum total of agent threat assessment
  is at least as high as the enemy threat assessment.
  - Ensure there is enough transport capacity to deploy at least one such mission per turn
- Ensure there is at least one lead always being investigated, by 1 agent.
- Ensure there is at least enough money available so that the player won't run out of money
  within next 3 turns.
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
playTurn():
  manageAgents()                     // See "Agent management"
  spendMoney()                       // See "Money spending"

manageAgents():
  // Unassign agents that need recovery
  unassignExhaustedAgents()          // See "Unassignment"

  // Deploy to missions according to priority and feasibility
  deployToMissions()                 // See "Mission deployment"

  // Ensure income covers per-turn costs (100-120% target)
  assignToContracting()              // See "Assignment to contracting"

  // Ensure at least one lead is being investigated
  assignToLeadInvestigation()        // See "Lead investigation"

  // Assign remaining idle agents to training
  assignToTraining()                 // See "Assignment to training"

spendMoney():
  if hasSufficientMoneyRunway():
    // Priority order for spending:
    upgradeCapacities()              // See "Capacity upgrade"
    upgradeAgentEffectiveness()      // See "Agent effectiveness capability upgrade"
    hireAgents()                     // See "Hiring"
```

## Unassignment

``` typescript
unassignExhaustedAgents():
  for agent in getAllAssignedAgents():
    if agent.exhaustion > exhaustionThreshold:
      unassignAgent(agent)  // Agent will recover while idle
```

Exhausted agents perform poorly and should recover before being reassigned.
The threshold determines when an agent is too exhausted to be effective.

## Mission deployment

``` typescript
deployToMissions():
  // Handle defensive missions first (mandatory)
  defensiveMissions = getDefensiveMissionsNearExpiry()
  for mission in defensiveMissions:
    deployToMission(mission)

  // Then offensive missions if resources allow
  offensiveMissions = getOffensiveMissions()
  for mission in offensiveMissions:
    if hasSpareAgentsForOffensive():
      deployToMission(mission)

deployToMission(mission):
  requiredThreat = mission.enemyThreatAssessment
  agents = selectAgentsForMission(requiredThreat)
  if sumThreat(agents) >= requiredThreat and hasTransportCapacity(agents):
    deployAgents(agents, mission)
```

Agent selection for missions ensures:
- Total agent threat meets or exceeds enemy threat.
- Agents are not exhausted.
- Transport capacity is available.

## Assignment to contracting

``` typescript
assignToContracting():
  perTurnCosts = calculatePerTurnCosts()
  targetIncome = perTurnCosts * 1.1  // Target 110% of costs (middle of 100-120% range)
  currentIncome = calculateContractingIncome()

  while currentIncome < targetIncome:
    agent = selectBestAgentForContracting()
    if agent is null:
      break
    assignAgentToContracting(agent)
    currentIncome = calculateContractingIncome()
```

Agents are selected for contracting based on:
- Being ready (not exhausted, not deployed, not recovering).
- Not being needed for imminent mission deployment.

## Lead investigation

``` typescript
assignToLeadInvestigation():
  if countAgentsInvestigatingLeads() >= 1:
    return  // Goal: at least 1 agent investigating

  availableLeads = getAvailableLeads()
  if availableLeads is empty:
    return

  lead = selectLeadToInvestigate(availableLeads)
  agent = selectBestAgentForInvestigation()
  if agent is not null:
    assignAgentToLead(agent, lead)
```

Lead selection prioritizes leads that spawn defensive missions,
as these are mandatory to handle.

## Assignment to training

``` typescript
assignToTraining():
  idleAgents = getIdleReadyAgents()
  availableTrainingSlots = trainingCapacity - countAgentsInTraining()

  for agent in idleAgents:
    if availableTrainingSlots <= 0:
      break
    assignAgentToTraining(agent)
    availableTrainingSlots -= 1
```

All idle agents should be training. This ensures continuous skill improvement
and that no agents are wasted sitting idle.

## Capacity upgrade

``` typescript
upgradeCapacities():
  // Priority: transport > training
  if transportCapacity < minTransportCapacity():
    upgradeTransportCapacity()
  if trainingCapacity < countAgents() - expectedContractingAgents():
    upgradeTrainingCapacity()
```

Transport capacity is prioritized because without it, agents cannot be deployed to missions.
Training capacity is secondary but important to ensure idle agents are always improving.

## Agent effectiveness capability upgrade

``` typescript
upgradeAgentEffectiveness():
  // Upgrade capabilities in priority order
  capabilities = [
    weaponBaseDamage,      // Direct combat improvement
    exhaustionRecovery,    // Faster agent turnaround
    hitPointsRecovery,     // Faster post-mission recovery
    trainingSkillGain      // Faster skill improvement
  ]
  for capability in capabilities:
    if shouldUpgrade(capability) and canAfford(capability):
      upgrade(capability)
```

The priority order reflects combat effectiveness first (to win missions),
then recovery rates (to maximize agent availability).

## Hiring

``` typescript
hireAgents():
  targetAgentCount = calculateTargetAgentCount()
  currentAgentCount = countAgents()
  agentsToHire = max(0, targetAgentCount - currentAgentCount)

  for i in 1..agentsToHire:
    if canAffordHire():
      hireAgent()
```

The target agent count is determined by the need to:
- Have enough agents to deploy on expected defensive missions.
- Have enough agents to cover contracting needs.
- Have spare agents for training and lead investigation.

# Future work

- Smarter selection of which capabilities to upgrade.
- Smarter selection of which agents to assign to what, based on their skill level.
  (higher skill means better threat level for mission deployment but also better efficiency
  in assignments).
- Smarter selection of which leads to investigate and how many.
  - Specifically, decision on if to investigate leads that spawn offensive missions.
- Smarter assignment of agents to lead investigations, to make good forward progress.
