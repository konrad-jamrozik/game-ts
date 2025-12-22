# About data

- [About data](#about-data)
- [Reference of `dataTables`](#reference-of-datatables)
- [Reference of game state collections](#reference-of-game-state-collections)
- [Collection item instantiation](#collection-item-instantiation)
  - [During game initialization](#during-game-initialization)
  - [During game session](#during-game-session)

The game data is organized into two main categories:
- The immutable data tables - see [`about_data_tables.md`](about_data_tables.md) for more
  details.
- The mutable game state collections - see [`about_collections.md`](about_collections.md) for
  more details.

# Reference of `dataTables`

Following data tables exist:

```typescript
dataTables.factionOperationLevels
dataTables.offensiveMissions
dataTables.defensiveMissions
dataTables.factionActivityLevels
dataTables.enemies
dataTables.leads
dataTables.factions
```

# Reference of game state collections

| Collection(s)         | Location in `gameState`                   | Data tables referenced by `bld<entity>` functions              |
| --------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `factions`            | `gameState.factions`                      | `dataTables.factions`                                          |
| `agents`              | `gameState.agents`                        | None                                                           |
| `missions`            | `gameState.missions`                      | `dataTables.offensiveMissions`, `dataTables.defensiveMissions` |
| `lead investigations` | `gameState.leadInvestigations`            | `dataTables.leads`                                             |
| `enemies`             | `gameState.missions[x].enemies`           | None                                                           |
| `weapons`             | `gameState.agents[x].weapon`,             |                                                                |
|                       | `gameState.missions[x].enemies[y].weapon` | None                                                           |

# Collection item instantiation

This section documents when and how each collection item is instantiated during a game session.

## During game initialization

When a new game starts, `bldInitialState()` in `gameStateFactory.ts` creates the initial game state:

| Collection              | Instantiation                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| **Factions**            | All factions via `bldFactions()`, which maps over `dataTables.factions` and calls `bldFaction()` |
| **Lead investigations** | Starts as empty object `{}`                                                                      |
| **Missions**            | Starts as empty array `[]`                                                                       |
| **Agents**              | Four initial agents via `bldInitialAgents()`                                                     |
| **Enemies**             | Empty (no missions exist during initialization)                                                  |
| **Weapons**             | For agents: When initial agents are constructed via `bldInitialAgents()`                         |

Note: `Factions` collection does not mutate during game session - no factions added/removed. Only properties updated.

## During game session

Collection items are instantiated in response to player actions or game events:

| Collection              | When instantiated                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Lead investigations** | When the "investigate lead" player action is invoked                                                                |
| **Missions**            | 1. When a lead investigation completes successfully<br>2. When a faction's `turnsUntilNextOperation` reaches 0      |
| **Agents**              | When the "hire agent" player action is invoked                                                                      |
| **Enemies**             | When a mission is constructed (as part of mission creation)                                                         |
| **Weapons**             | 1. For agents: When an agent is hired<br>2. For enemies: When an enemy is constructed (as part of mission creation) |
