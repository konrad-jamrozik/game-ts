# About deployed mission site

This document explains how a deployed mission site is updated upon turn advancement.

Refer to [Definitions](#definitions) for definitions of terms used in this document.

Upon turn advancement, the following happens with a deployed mission site:

- Each agent deployed to the mission site makes two rolls: `mission objective` and `hit points lost` roll.
  See [Agent rolls](#agent-rolls).
- For each agent, the result of their respective rolls are applied to them. See [Agent results](#agent-results).
- The mission site state changes to `Successful` if all objectives are fulfilled, or `Failed` otherwise.
- If the mission site is `Successful`, the mission rewards are applied.

## Agent rolls

Each agent deployed to the mission site makes two rolls, in this order:

- `Mission objective roll`: This roll determines if the agent successfully completed a mission objective.
- `Hit points lost roll`: This roll determines how much damage the agent sustained during the mission.

Agents roll in order of lowest skill to highest skill, against the lowest difficulty yet unfulfilled objective.

If by the time given agent `Mission objective roll` is supposed to happen all objectives have been already fulfilled,
then the roll is skipped and instead only the `Hit points lost roll` is made for that agent.

### Mission objectives roll

If an agent rolls above `roll threshold` for given objective, the objective is marked as fulfilled.

For example, an agent with skill 100 rolling against objective with difficulty 30 must roll 31 or above to
fulfill the objective. As such, they have a 70% chance of fulfilling the objective.

### Hit points lost roll

Next, the agent rolls for hit points lost. The `roll threshold` is computed against mission site difficulty.

If the agent rolls at `roll threshold` or above, they lose no hit points. For a roll below the threshold,
they lose `roll threshold - roll` hit points.

If the agent loses all their hit points, they are terminated.

Note that agent can fulfill an objective even if they are terminated, because the `Hit points lost roll`
happens after the `Mission objective roll`.

## Agent results

All surviving agents deployed to mission suffer `AGENT_EXHAUSTION_RECOVERY_PER_TURN` exhaustion.
In addition, they suffer an extra `AGENT_EXHAUSTION_RECOVERY_PER_TURN` exhaustion for each terminated agent.

Every agent that lost any hit points must spend 1 turn in recovery for each 2% of total hit points lost, rounded up.

For example, an agent with 30 hit points total that lost 7 hit points has lost 23.(3)% of their hit points, and as such
they must spend 12 turns in recovery (11.(6) rounded up to 12).

While agent is recovering lost hit points, they continue to recover from exhaustion as normal.

Any agent that survived gains skill points, depending on how many missions they survived.
If this is their `Nth` mission they survived, they gain number of skill points equal to `MISSION_SURVIVAL_SKILL_REWARD[N-1]`.
If `N` is greater than number of elements in `MISSION_SURVIVAL_SKILL_REWARD`, they gain the skill points equal to
the last element in that list.

## Definitions

**Roll**: A random number between 1 and 100, inclusive.

**Roll threshold**: Equal to `100 - skill + difficulty`.

**Objective difficulty**: The difficulty of given objective, used to compute `roll threshold` for `Mission objective roll`
for given agent and objective.

**Mission site difficulty**: The difficulty of the mission site, used to compute `roll threshold`
for `Hit points lost roll` of given agent.

**Agent termination**: A termination of agent means settings both their state and assignment to `Terminated`.

# KJA mission-site TODOs for deployed mission site update

- reduce exhaustion with recovery
- restore hit points as agent recovers
- log to console details of agent rolls during deployed mission site update
- update doc exhaustion should reduce skill by percentage. 15 exhaustion = 15% skill reduction
