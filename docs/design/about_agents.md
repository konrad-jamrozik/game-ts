# About agents

This document explains the ruleset governing agents in the game.

# Agent attributes

**id** - Unique identifier for the agent.

**turnHired** - The turn when the agent was hired.

**skill** - The agent's skill level, which affects their performance on mission sites and assignments.

**exhaustion** - The agent's exhaustion level, which affects their performance on mission sites and assignments.

**maxHitPoints** - The maximum hit points of the agent, which determine their survivability on mission sites.

**hitPoints** - The agent's current hit points.

**recoveryTurnsRemaining** - The number of turns the agent needs to fully recover from lost hit points.

**missionsSurvived** - The number of missions the agent has survived.

**state** - The current state of the agent.

**assignment** - The current assignment of the agent.

# Agent states and assignments

`Assignment` denotes agent orders while `State` denotes what is currently happening with the agent.

When an agent is first hired their `State` is `InTransit` and their `Assignment` is `Standby`.

# Agent assignments

# Agent deployment to a mission site

# Agent skill

# Agent exhaustion

# Agent hit points and recovery

# TODOs

KJA rename to "recoveryTurnsRemaining" to "RecoveryTurns".
