# About deployed mission sites

This document explains how a deployed mission site is updated upon turn advancement.

Refer to [Definitions](#definitions) for definitions of terms used in this document.

Upon turn advancement, the following happens with a deployed mission site:

1. First, agents engage `mission site battle`. As a result of of the battle agents may suffer exhaustion,
   damage and termination.

2. Once the battle concludes, the mission site state is determined: `Successful` or `Failed`.
   If the mission site state is `Successful`, the mission rewards are applied to the player.

3. Next, surviving agents state is updated:
   - State is set to  `InTransit`
   - Assignment is set depending on if the agent sustained any damage:
     - If the agent sustained any damage, assignment is set to `Recovery`.
     - If the agent sustained no damage, assignment is set to `Standby`.
   - Agent mission-conclusion exhaustion is applied (this is in addition to exhaustion that was already applied
     during combat rounds.
   - Agent skill is updated.

4. Finally, a `mission site report` is generated and appended to `turn report`.

For details refer to sections below.

# Mission site battle

Agents deployed to the mission site engage in `mission site battle` against enemy units on the mission site.
The battle is composed of one or more `combat rounds`.

The battle concludes if at the end of given combat round one of these is true:

- All enemies have been neutralized.
- All agents have been terminated.
- The agent mission commander orders a retreat of the agents.

Otherwise, next combat round is started.

## Retreat order

The agent mission commander orders a retreat of the agents if the following is true:

- All the agents taken together have lost more than 50% of their original effective skill,
  as it has been at the start of the mission.

# Combat round

Each `combat round` is composed of one or more `attacks`.

The `attack` in given combat round happen in order of least skilled agent to most skilled agent, or agent with
lowest ID in case of equal skill. Given agent always attacks the enemy with lowest effective skill, or lowest
ID in case of equal effective skill.

Given enemy can be attacked for the second time in given combat round only after all other enemies have been
attacked. Generally, for given enemy to be attacked for `N+1`th time in given combat round, all other enemies must have
been attacked at least `N` times in the same round.

Once all agents have attacked once each, all the surviving enemies are attacking agents, using the same
algorithm, but with sides reversed.

Once all agents and enemies have attacked once each, the combat round concludes.

# Attack

An `attack` is composed of following steps:

- The attacker does a `contest roll` against the defender, both of them comparing their `effective skills`.
- If the attack roll fails, nothing happens.
- If the attack roll succeeds, the attacker does `range roll` for `damage` using their `weapon`.
  Then, the damage is subtracted from the defender's hit points.
  If the defender's hit points are reduced to 0, the defender is neutralized.
  In case the defender is an agent, the agent is terminated.
- The attacker suffers 1 exhaustion.
- The defender, if not already neutralized, suffers 1 exhaustion.

# Contest roll

A `contest roll` is a `roll` made by the attacker against the defender, both of them comparing the `contested value`,
typically `effective skill`.

The `contest roll` results in `success` or `failure` based on following formula:

`P(success) = 1 / (1+(D/A)^2)`

where:

- `D` is the defender's contested value, typically `effective skill`.
- `A` is the attacker's contested value, typically `effective skill`.
- The probability is computed with precision of 4 decimal places, rounded down.

Note: the formula is a Bradley–Terry form with exponent `k=2`. It can be also expressed as:
`P(success) = A^k / (A^k + D^k)`.

Thus you can think about a "duel" as a following pair:

``` text
P(agent_attack_success) = agent_skill^2 / (agent_skill^2 + enemy_skill^2)
P(enemy_attack_success) = enemy_skill^2 / (enemy_skill^2 + agent_skill^2)
```

Example values for `P(success)` for varying attacker effective skill `Att` and defender effective skill `D=100`

| Att   | P(success) |
|:-----:|:----------:|
| 100   | 50.00%     |
| 110   | 54.75%     |
| 120   | 59.02%     |
| 130   | 62.83%     |
| 140   | 66.22%     |
| 150   | 69.23%     |
| 160   | 71.91%     |
| 170   | 74.29%     |
| 180   | 76.42%     |
| 190   | 78.31%     |
| 200   | 80.00%     |
| 250   | 86.21%     |
| 300   | 90.00%     |
| 400   | 94.12%     |
| 500   | 96.15%     |

# Range roll

A `range roll` is a `roll` made from a given `range`, with each value being equally likely.
Typically used do roll for `damage` using a `weapon` as the range provider.

For example a `range` of 5-15 means there are 11 possible values, each being rolled with probability 1/11.

# Mission site result and awards

The mission site result is determined by the reason the `mission site battle` concluded:

- If all enemies have been neutralized, the mission site state is set to `Successful`.
- If all agents have been terminated, the mission site state is set to `Failed`.
- If the agent mission commander orders a retreat, the mission site state is set to `Failed`.

If mission site state is `Successful`, the mission site awards are awarded to the player.

# Agent update

## Agent exhaustion update

Every time agent attacks an enemy, or is attacked by any enemy, they suffer 1 exhaustion.

All surviving agents deployed to mission site suffer `AGENT_EXHAUSTION_RECOVERY_PER_TURN`
once the mission site concludes.

In addition, any surviving agent suffers `AGENT_EXHAUSTION_RECOVERY_PER_TURN` exhaustion for each agent
terminated during the mission.

For example:

- An agent attacked during the mission `3` times and was attacked `5` times, thus suffering `8` exhaustion.
- Two other agents were terminated during the mission.
- The agent survived to the mission site conclusion.
- Total agent exhaustion is thus `8 + 3 * AGENT_EXHAUSTION_RECOVERY_PER_TURN`.

## Agent skill update

An agent gains skill points for the following reasons:

- Surviving the mission site.
- Attacking an enemy and being attacked by an enemy.

Any agent that survived gains skill points, depending on how many missions they survived.
If this is their `Nth` mission they survived, they gain number of skill points equal to `MISSION_SURVIVAL_SKILL_REWARD[N-1]`.
If `N` is greater than number of elements in `MISSION_SURVIVAL_SKILL_REWARD`, they gain the skill points equal to
the last element in that list.

Furthermore:

- A successful attack skill roll against an enemy gives `AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD` skill points.
- A failed attack skill roll against an enemy gives `AGENT_FAILED_ATTACK_SKILL_REWARD` skill points.
- A successful defense skill roll against an attack gives `AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD` skill points.
- A failed defense skill roll against an attack gives `AGENT_FAILED_DEFENSE_SKILL_REWARD` skill points.

Skill points are awarded to given surviving agent at the end of the deployed mission site update.
This means their skill points do not change during the mission site battle, and as such do not influence the
the contest rolls and combat rounds outcomes.

## Agent state and assignment update

Depending on the agent update as part of the mission site update, the agent will be updated as follows:

- If agent survived the mission with no hit points lost:
  - Their state is set to `InTransit` and assignment set to `Standby`.
- If agent survived the mission with hit points lost:
  - Their state is set to `InTransit` and assignment set to `Recovery`.
- If agent was terminated during the mission:
  - Their state is set to `Terminated` and assignment set to `N/A`.

# Implementation details

The file [about_turn_advancement.md](about_turn_advancement.md) describes, among other things,
in which order the updates to deployed mission sites and agents deployed on them are implemented.

# Definitions

`effective_skill` is defined in [About agents / effective skill](about_agents.md#effective-skill).

**Agent termination**: A termination of agent means settings both their state and assignment to `Terminated`.
