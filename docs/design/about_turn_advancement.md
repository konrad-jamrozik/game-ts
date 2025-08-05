# About turn advancement

When a turn is advanced, a series of updates of game state are performed, resulting in a a new game state.

On a high level, the update logic consists of following steps:

- Update all agents in `Available` state.
- Update all agents in `Recovering` state.
- Update all agents in `InTransit` state.
- Update all agents in `OnAssignment` state and `Contracting` assignment.
- Update all agents in `OnAssignment` state and `Espionage` assignment.
- Update all active non-deployed mission sites.
- Update all deployed mission sites, thus also updating all agents deployed to them.
- Update player assets based on the results of the previous steps.
- Update panic, also based on the results of the previous steps.
- Update factions, also based on the results of the previous steps.

Below each step is described in detail.

# Updating agents in `Available` state

Apply exhaustion recovery.

# Updating agents in `Recovering` state

Apply lost hit points and exhaustion recovery.

## Updating Agents in `InTransit` state

Apply appropriate state and assignment updates.

## Updating Agents on `Contracting` assignment

Compute money earned to be later used to update player assets.
Then apply exhaustion increase.

## Updating Agents on `Espionage` assignment

Compute intel earned to be later used to update player assets.
Then apply exhaustion increase.

## Updating active non-deployed mission sites

Apply mission site expiration progress and expire mission sites that have expired.

## Updating Deployed Mission Sites

Update all deployed mission sites, including all agents deployed to them.

Here we describe the implementation order, while full details are available in [about_deployed_mission_site.md](about_deployed_mission_site.md).

For each deployed mission site:

1. Roll for objective fulfillment for each objective in appropriate order.
2. Roll for hit points lost for each agent deployed to the mission site.
3. Terminate agents that lost all their hit points.
4. Award "survived mission count" increase and skill points to agents that survived the mission.
5. Apply agent exhaustion increases.
6. Update agent state and assignment based on their final state (no hit points lost, hit points lost, or terminated).
7. Update mission site state depending on if its objectives were fulfilled or not.
8. If mission was fulfilled, return the mission site rewards to be later used to update player assets.

# Updating Player Assets

Update player assets based on the results of the previous steps. This includes:

- Adding money earned by agents on `Contracting` assignment.
- Adding intel gathered by agents on `Espionage` assignment.
- Adding mission site rewards for each `Successful` mission site.

# Updating panic

Update panic based on the total factions panic increase formula,
which incorporates `threatLevel` and `suppression` of all factions.

Then apply panic reduction reward from any `Successful` mission sites.

# Updating Factions

Update factions, also based on the results of the previous steps. This includes, for each faction:

- Increasing faction `threat level` by `threatIncrease` adjusted by `suppression`
- Then decaying the `suppression`
- Then applying any `Successful` mission sites rewards:
  - Decreasing the `threat level`
  - Increasing the `suppression`
