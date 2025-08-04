# About deployed mission site

This document explains how a deployed mission site is updated upon turn advancement.

Refer to [Definitions](#definitions) for definitions of terms used in this document.

Upon turn advancement, the following happens with a deployed mission site:

- Each agent deployed to the mission site makes two rolls: `mission objective` and `hit points lost` roll.
  See [Agent rolls](#agent-rolls).
- For each agent, the result of their respective rolls are applied to them. See [Agent update](#agent-update).
- The mission site state changes to `Successful` if all objectives are fulfilled, or `Failed` otherwise.
- If the mission site is `Successful`, the mission rewards are applied.

# Agent rolls

Each agent deployed to the mission site makes two rolls, in this order:

- `Mission objective roll`: This roll determines if the agent successfully completed a mission objective.
- `Hit points lost roll`: This roll determines how much damage the agent sustained during the mission.

Agents roll in order of lowest skill to highest skill, against the lowest difficulty yet unfulfilled objective.

If by the time given agent `Mission objective roll` is supposed to happen all objectives have been already fulfilled,
then the roll is skipped and instead only the `Hit points lost roll` is made for that agent.

## Mission objectives roll

If an agent rolls above `roll threshold` for given objective, the objective is marked as fulfilled.

For example, an agent with skill 100 rolling against objective with difficulty 30 must roll 31 or above to
fulfill the objective. As such, they have a 70% chance of fulfilling the objective.

## Hit points lost roll

Next, the agent rolls for hit points lost. The `roll threshold` is computed against mission site difficulty.

If the agent rolls at `roll threshold` or above, they lose no hit points. For a roll below the threshold,
they lose `roll threshold - roll` hit points.

If the agent loses all their hit points, they are terminated.

Note that agent can fulfill an objective even if they are terminated, because the `Hit points lost roll`
happens after the `Mission objective roll`.

# Agent update

## Agent exhaustion update

All surviving agents deployed to mission site suffer `AGENT_EXHAUSTION_RECOVERY_PER_TURN`
exhaustion upon deployed mission site update.
In addition, they suffer `AGENT_EXHAUSTION_RECOVERY_PER_TURN` exhaustion for each agent terminated during the mission.

## Agent skill update

Any agent that survived gains skill points, depending on how many missions they survived.
If this is their `Nth` mission they survived, they gain number of skill points equal to `MISSION_SURVIVAL_SKILL_REWARD[N-1]`.
If `N` is greater than number of elements in `MISSION_SURVIVAL_SKILL_REWARD`, they gain the skill points equal to
the last element in that list.

## Agent state and assignment update

Depending on the agent update as part of the mission site update, the agent will be updated as follows:

- If agent survived the mission with no hit points lost:
  - Their state is set to `InTransit` and assignment set to `Standby`.
- If agent survived the mission with hit points lost:
  - Their state is set to `InTransit` and assignment set to `Recovery`.
- If agent was terminated during the mission:
  - Their state is set to `Terminated` and assignment set to `N/A`.

# Definitions

**Roll**: A random number between 1 and 100, inclusive.

**Roll threshold**: Equal to `100 - effective_skill + difficulty` where:

`difficulty` is provided by the roll context: e.g. mission site difficulty, or objective difficulty.

`effective_skill` is defined in [About agents / effective skill](about_agents.md#effective-skill).

**Objective difficulty**: The difficulty of given objective, used to compute `roll threshold` for `Mission objective roll`
for given agent and objective.

**Mission site difficulty**: The difficulty of the mission site, used to compute `roll threshold`
for `Hit points lost roll` of given agent.

**Agent termination**: A termination of agent means settings both their state and assignment to `Terminated`.

# KJA mission-site TODOs for deployed mission site update

- reduce exhaustion with recovery
- log to console details of agent rolls during deployed mission site update
