# About data

- [About data](#about-data)
- [Reference of `dataTables`](#reference-of-datatables)
- [Reference of game state collections](#reference-of-game-state-collections)
- [Collection item instantiation](#collection-item-instantiation)
  - [During game initialization](#during-game-initialization)
  - [During game session](#during-game-session)
    - [Agents](#agents)
    - [Lead investigations](#lead-investigations)
    - [Missions](#missions)
    - [Enemies](#enemies)
    - [Weapons](#weapons)

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

| Collection(s)         | Location                                  | Data tables referenced by `bld<entity>` functions                          |
| --------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `factions`            | `gameState.factions`                      | `dataTables.factions`                                                       |
| `agents`              | `gameState.agents`                        | None                                                                        |
| `missions`            | `gameState.missions`                      | `dataTables.offensiveMissions`, `dataTables.defensiveMissions`              |
| `lead investigations` | `gameState.leadInvestigations`            | `dataTables.leads`                                                          |
| `enemies`             | `gameState.missions[x].enemies`           | None                                                                        |
| `weapons`             | `gameState.agents[x].weapon`,             |                                                                             |
|                       | `gameState.missions[x].enemies[y].weapon` | None                                                                        |

# Collection item instantiation

This section documents when and how each collection item is instantiated during a game session.

## During game initialization

When a new game starts, `bldInitialState()` in `gameStateFactory.ts` creates the initial game state:

- **Factions**: All factions are constructed via `bldFactions()`, which maps over
  `dataTables.factions` and calls `bldFaction()` for each faction data entry.
  **Note**: The factions collection does not mutate during the game session - no factions are added or removed.
  Only faction properties (activity level, suppression, etc.) are updated during gameplay.

- **Agents**: Four initial agents are constructed via `bldInitialAgents()`.

- **Missions**: The missions collection starts as an empty array `[]`.

- **Lead investigations**: The lead investigations collection starts as an empty object `{}`.

## During game session

Collection items are instantiated in response to player actions or game events:

### Agents

- When the "hire agent" player action is invoked.

### Lead investigations

- When the "investigate lead" player action is invoked.

### Missions

Missions are constructed in two scenarios:

1. **When a lead investigation completes successfully**

2. **When a faction's operation counter reaches 0**

### Enemies

- **When**: When a mission is constructed (as part of mission creation).

### Weapons

Weapons are constructed in two scenarios:

1. **For agents**: When an agent is constructed (during initialization or when hiring):

2. **For enemies**: When an enemy is constructed (as part of mission creation):
