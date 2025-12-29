---
name: Smart Lead Selection
overview: Enhance the basic intellect's lead selection to intelligently choose repeatable leads based on mission deployability, sorting by threat level and checking if deployment would succeed before investigating.
todos:
  - id: threat-from-lead
    content: Add getMissionThreatForLead() helper to calculate threat from lead's resulting mission
    status: completed
  - id: can-deploy-check
    content: Add canDeployMissionWithCurrentResources() to check deployment feasibility without side effects
    status: completed
  - id: select-lead-logic
    content: Modify selectLeadToInvestigate() to sort repeatable leads by threat and check deployability
    status: completed
  - id: pile-agents
    content: Modify assignToLeadInvestigation() to pile agents on a single repeatable lead
    status: completed
---

# Smart Repeatable Lead Selection for Basic Intellect

## Summary

When only repeatable leads remain available, the basic intellect will:

1. Sort repeatable leads by resulting mission threat (descending - hardest first)
2. Check if each mission could be successfully deployed with current resources
3. Investigate the first deployable lead and pile all remaining agents on it
4. Skip investigation entirely if no leads would result in deployable missions

## Key Files

- [`web/src/ai/intellects/basic/leadInvestigation.ts`](web/src/ai/intellects/basic/leadInvestigation.ts) - Main file to modify
- [`web/src/ai/intellects/basic/missionDeployment.ts`](web/src/ai/intellects/basic/missionDeployment.ts) - Reference for deployment logic

## Implementation

### 1. Add helper to get mission threat from a lead

Create a function `getMissionThreatForLead(leadId)` that:

- Looks up offensive missions depending on the lead via `dataTables.offensiveMissions.filter(m => m.dependsOn.includes(leadId))`
- Creates a temporary mission with enemies using `bldMission`
- Calculates threat using `calculateMissionThreatAssessment`
- Returns the maximum threat if multiple missions depend on the lead

### 2. Extract deployment feasibility check

Create `canDeployMissionWithCurrentResources(gameState, mission)` that mirrors the checks in `deployToMission`:

- Minimum agent count: `floor(enemies.length / MAX_ENEMIES_PER_AGENT)`
- Threat threshold: `targetThreat = enemyThreat * TARGET_AGENT_THREAT_MULTIPLIER`
- Transport capacity: `getRemainingTransportCap`

Returns `true` if deployment would succeed without actually modifying state.

### 3. Modify `selectLeadToInvestigate`

```javascript
flow
1. Non-repeatable leads available? -> Pick at random (unchanged)
2. Only repeatable leads:
   a. Get leads with their mission threats
   b. Sort by threat descending
   c. For each lead:
    - Create temporary mission from lead
    - Check canDeployMissionWithCurrentResources()
    - If yes, return this lead
   d. If none pass, return undefined
```



### 4. Modify `assignToLeadInvestigation` loop

Track when a repeatable lead is selected. For subsequent agent assignments:

- If a repeatable lead was already selected for investigation, pile agents on the existing investigation
- Do not select new repeatable leads for additional agents
```javascript
flow
for each agent to assign:
  if (repeatableLeadAlreadySelected)
    -> add to existing investigation
  else
    lead = selectLeadToInvestigate()
    if (lead is repeatable)
      repeatableLeadAlreadySelected = lead
    -> start/add to investigation





```