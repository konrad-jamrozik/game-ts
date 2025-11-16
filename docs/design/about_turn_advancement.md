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
8. Update lead investigations.
9. Update all active non-deployed mission sites.
10. Evaluate all deployed mission sites, thus also updating all agents deployed to them.
11. Update player assets based on the results of previous steps.
12. Get agents report.
13. Update panic, based on the results of previous steps.
14. Update factions, based on the results of previous steps.

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

## 8. Update lead investigations

Update lead investigations: check for completion, apply decay, accumulate intel.
Agents completing investigations transition to `InTransit` state.

## 9. Update active non-deployed mission sites

Apply mission site expiration progress and expire mission sites that have expired.

## 10. Evaluate deployed mission sites

Evaluate all deployed mission sites, including all agents deployed to them.

Here we describe the implementation order, while full details are available in [about_deployed_mission_site.md](about_deployed_mission_site.md).

For each deployed mission site:

1. Evaluate the mission site battle between deployed agents and enemy units. This includes:
   - Multiple combat rounds until the battle concludes (all enemies neutralized, all agents terminated, or retreat ordered).
   - During combat, agents and enemies attack each other, potentially losing hit points and causing exhaustion.
   - Agents may be terminated if they lose all hit points during combat.
2. Update agents after battle:
   - Terminate agents that lost all their hit points.
   - For agents that survived:
     1. Apply agent exhaustion increases (mission conclusion exhaustion plus additional exhaustion for each terminated agent).
     2. Award "survived mission count" increase and appropriate skill points (from battle combat and mission survival).
     3. Update agent state and assignment based on their final state (whether lost hit points or not).
3. Determine mission site state: `Successful` if all enemies were neutralized, otherwise `Failed`.
4. If mission site state is `Successful`, return the mission site rewards to be later used to update player assets.

# 11. Update player assets

Update player assets based on the results of previous steps. This includes:

- Adding money earned by agents on `Contracting` assignment.
- Adding intel gathered by agents on `Espionage` assignment.
- Adding mission site rewards for each `Successful` mission site.

# 12. Get agents report

Generate agents report tracking changes in agent counts and states.

# 13. Update panic

Update panic based on the total factions panic increase formula,
which incorporates `threatLevel` and `suppression` of all factions.

Then apply panic reduction reward from any `Successful` mission sites.

# 14. Update factions

Update factions, based on the results of previous steps. This includes, for each faction:

- Increasing faction `threat level` by `threatIncrease` adjusted by `suppression`
- Then decaying the `suppression`
- Then applying any `Successful` mission sites rewards:
  - Decreasing the `threat level`
  - Increasing the `suppression`
