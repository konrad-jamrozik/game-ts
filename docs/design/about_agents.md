# About agents

This document explains the ruleset governing agents in the game.

# Agent states and assignments

`Assignment` denotes current agent orders / activity, while `State` denotes what is currently happening with the agent.

# Agent hiring and sacking

Agent costs `AGENT_HIRE_COST` to hire.

When an agent is first hired their state is `InTransit` and their assignment is `Standby`.

When an agent is sacked, their state becomes `Terminated` and assignment becomes `N/A`.

# Agents in transit

If an agent is in `InTransit` state, upon turn advancement their state will change to state
as dictated by the assignment:

- `Standby` assignment → `Available` state
- `Contracting` assignment → `OnAssignment` state
- `mission-site-id` assignment → `OnMission` state
- `Espionage` assignment → `OnAssignment` state
- `Recovery` assignment → `Recovering` state

# Agent deployment to a mission site

Only agents in `Available` state can be deployed to a mission site.

When an agent is deployed to a mission site, their state changes from `InTransit` to `OnMission`
and their assignment becomes the mission site ID.

Furthermore, during turn advancement, an agent deployed to a mission site participates in deployed mission site update,
as described in [about_deployed_mission_site.md](about_deployed_mission_site.md).

# Agent update on deployed mission site update

Upon deployed mission site update, a deployed agent state and assignment are updated, as described in
[about_deployed_mission_site.md](about_deployed_mission_site.md).

# Agent skill

Agent skill affects performance on missions and assignments. Agents start with `AGENT_INITIAL_SKILL`.

Agents gain skill points when they survive missions.
Refer to [about_deployed_mission_site.md](about_deployed_mission_site.md).

## Effective skill

Agent `skill` is used to compute `effective_skill`. `effective_skill` is equal to agent `skill` reduced by
percentage equal to agent `exhaustion`, rounded down.
That is, `effective_skill = floor(skill * (1 - exhaustion / 100))`.

For example, an agent with `skill` of 116 and `exhaustion` of 15 will have `effective_skill` of `floor(116 * 85%) = 98`.

## Skill effects

Skill affects:

- Agent's rolls in deployed mission sites, see [about_deployed_mission_site.md](about_deployed_mission_site.md)
- Agent performance on assignments, such as `Contracting` and `Espionage`.

# Agent exhaustion

Agent exhaustion is a measure of how fatigued an agent is, which affects their performance on missions and assignments.

Agent exhaustion has following effects:

- Reduces agent effective skill during rolls in deployed mission site update. See [about_deployed_mission_site.md](about_deployed_mission_site.md).
- Reduces agent effective skill during assignments: KJA TODO: document how

Agent exhaustion changes as follows:

- Increases by `AGENT_EXHAUSTION_INCREASE_PER_TURN` when turn is advanced
  while they are on `Contracting` or `Espionage` assignments.
- Increases upon deployed mission site update, see [about_deployed_mission_site.md](about_deployed_mission_site.md).
- Decreases by `AGENT_EXHAUSTION_RECOVERY_PER_TURN`
  when turn is advanced while they are in `Available` or `Recovering` state.

# Contracting and espionage assignments

Only agents in `Available` state can be assigned to `Contracting` or `Espionage` missions.

When an agent is assigned to `Contracting` or `Espionage`, their state changes
to `InTransit`.

When turn is advanced while agent is in `OnAssignment` state:

- If agent is in `Contracting` assignment, they earn `floor(AGENT_CONTRACTING_INCOME * effective_skill / 100)`.
- If agent is in `Espionage` assignment, they gather `floor(AGENT_ESPIONAGE_INTEL * effective_skill / 100)` intel.
- Agent suffers exhaustion. See [Agent exhaustion](#agent-exhaustion) for details.

For definition of `effective_skill`, see [effective skill section](#effective-skill).

## Recalling agents from assignments

Any agent on `Contracting` or `Espionage` assignment can be recalled.
This changes their state to `InTransit` and assignment to `Standby`.

# Agent lost hit points and recovery

Agents have hit points representing their health and survivability.

Agent can lose hit points as a result of deployed mission site update: see [about_deployed_mission_site.md](about_deployed_mission_site.md).

If agent loses all hit points, they are terminated.

Every agent that lost any hit points must spend 1 turn in recovery for each 2% of total hit points lost, rounded up.

For example, an agent with 30 hit points total that lost 7 hit points has lost 23.(3)% of their hit points, and as such
they must spend 12 turns in recovery (11.(6) rounded up to 12).

Agent counts as having spent turn in recovery if their state was `Recovering` during turn advancement.

Agent restores lost hit points every turn while they are in `Recovering` state.

The hit point amount restored is restored linearly based on the percentage of hit points lost,
taking the amount of turns as described above. Agent reaches full hit points only when all recovery turns have passed.
During recovery, the agent hit points restored so far are rounded down to nearest integer.

For example, an agent that lost 7 hit points out of total 30 hit points, must spend 12 turns in recovery.
As such, every turn they restore 7 / 12 = 0.583(3) hit points, rounded down. Hence:

| Turn in Recovery | Hit Points Restored | Before rounding |
|------------------|--------------------|------------------|
| 0                | 0                  | 0                |
| 1                | 0                  | 0.583(3)         |
| 2                | 1                  | 1.166(6)         |
| 3                | 1                  | 1.75             |
| 4                | 2                  | 2.333(3)         |
| 5                | 2                  | 2.916(6)         |
| 6                | 3                  | 3.5              |
| 7                | 4                  | 4.083(3)         |
| 8                | 4                  | 4.666(6)         |
| 9                | 5                  | 5.25             |
| 10               | 5                  | 5.833(3)         |
| 11               | 6                  | 6.416(6)         |
| 12               | 7                  | 7                |

When a turn is advanced when agent was in recovery and they had `recoveryTurns` equal to 1, they will
end up with:

- `hitPoints` equal to `maxHitPoints`,
- assignment changed from `Recovery` to `Standby`,
- and state changed from `Recovering` to `Available`.

# Reference: agent attributes

**id** - Unique identifier for the agent.

**turnHired** - The turn when the agent was hired.

**skill** - The agent's skill level, which affects their performance on mission sites and assignments.

**exhaustion** - The agent's exhaustion level, which affects their performance on mission sites and assignments.

**maxHitPoints** - The maximum hit points of the agent, which determine their survivability on mission sites.

**hitPoints** - The agent's current hit points.

**recoveryTurns** - The number of turns the agent needs to fully recover from lost hit points.

**missionsSurvived** - The number of missions the agent has survived.

**state** - The current state of the agent.

**assignment** - The current assignment of the agent.

# Reference: agent states

- **Available** - Agent is ready for assignment and not doing anything.
- **InTransit** - Agent is transiting to their assignment.
- **Recovering** - Agent is recovering from lost hit points and cannot be assigned.
- **OnAssignment** - Agent is actively working on contracting or espionage assignments.
- **OnMission** - Agent is deployed to a mission site.
- **Terminated** - Agent has died, was sacked, or otherwise lost.

# Reference: agent assignments

Agent assignments represent the orders given to agents:

- **Standby** - Agent is waiting for orders and recovering from exhaustion, if any (default assignment).
- **Contracting** - Agent is earning money through contracts.
- **Espionage** - Agent is gathering intelligence.
- **Recovery** - Agent is recovering from lost hit points.
- **N/A** - Agent has no assignment because they have been terminated.
- **mission-site-id** - Agent is deployed to a specific mission site (where `mission-site-id` is its ID)
