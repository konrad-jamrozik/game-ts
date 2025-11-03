# About turn advancement

When a turn is advanced, a series of updates of game state are performed, resulting in a a new game state.

This document describes implementation of `evaluateTurn` function, which is wrapped by the `advanceTurn` reducer.

On a high level, the update logic consists of following steps:

1. Update turn and actions counter
2. Compute agent upkeep
3. Update all agents in `Available` state.
4. Update all agents in `Recovering` state.
5. Update all agents in `OnAssignment` state and `Contracting` assignment.
6. Update all agents in `OnAssignment` state and `Espionage` assignment.
7. Update all agents in `InTransit` state.
8. Update all active non-deployed mission sites.
9. Evaluate all deployed mission sites, thus also updating all agents deployed to them.
10. Update player assets based on the results of the previous steps.
11. Update panic, also based on the results of the previous steps.
12. Update factions, also based on the results of the previous steps.

Below each step is described in detail.

# 1. Update turn and actions counter

Increment the turn counter and reset the actions counter.

# 2. Compute agent upkeep

Compute agent upkeep for agents as they were before any any further changes to agent
state in the turn, notably, possible termination. This is because upkeep must be paid
for all agents that haven't been terminated when the turn was advanced.

# 3. Update agents in `Available` state

Apply exhaustion recovery.

# 4. Update agents in `Recovering` state

Apply lost hit points and exhaustion recovery.

## 5. Update agents on `Contracting` assignment

Compute money earned to be later used to update player assets.
Then apply exhaustion increase.

## 6. Update agents on `Espionage` assignment

Compute intel earned to be later used to update player assets.
Then apply exhaustion increase.

## 7. Update agents in `InTransit` state

Apply appropriate state and assignment updates.

## 8. Update active non-deployed mission sites

Apply mission site expiration progress and expire mission sites that have expired.

## 9. Evaluate deployed mission sites

Evaluate all deployed mission sites, including all agents deployed to them.

Here we describe the implementation order, while full details are available in [about_deployed_mission_site.md](about_deployed_mission_site.md).

For each deployed mission site:

1. Roll for objective fulfillment for each objective in appropriate order.
2. Roll for hit points lost for each agent deployed to the mission site.
3. Terminate agents that lost all their hit points.
4. For agents that survived:
   1. Apply agent exhaustion increases.
   2. Award "survived mission count" increase and appropriate skill points.
   3. Update agent state and assignment based on their final state (whether lost hit points or not).
5. Update mission site state depending on if its objectives were fulfilled or not.
6. If mission was fulfilled, return the mission site rewards to be later used to update player assets.

# 10. Update player assets

Update player assets based on the results of the previous steps. This includes:

- Adding money earned by agents on `Contracting` assignment.
- Adding intel gathered by agents on `Espionage` assignment.
- Adding mission site rewards for each `Successful` mission site.

# 11. Update panic

Update panic based on the total factions panic increase formula,
which incorporates `threatLevel` and `suppression` of all factions.

Then apply panic reduction reward from any `Successful` mission sites.

# 12. Update factions

Update factions, also based on the results of the previous steps. This includes, for each faction:

- Increasing faction `threat level` by `threatIncrease` adjusted by `suppression`
- Then decaying the `suppression`
- Then applying any `Successful` mission sites rewards:
  - Decreasing the `threat level`
  - Increasing the `suppression`
