# About data

- [About data](#about-data)
- [Reference of `dataTables`](#reference-of-datatables)
- [Reference of game state collections](#reference-of-game-state-collections)

The game data is organized into two main categories:
- The immutable data tables - see [`about_data_tables.md`](about_data_tables.md) for more details.
- The mutable game state collections - see [`about_collections.md`](about_collections.md) for more details.

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

| Collection(s)         | Location                        | Data tables referenced by `bld<entity>` functions from `<entity>factory.ts` |
| --------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| `factions`            | `gameState.factions`            | `dataTables.factions` (copies properties from `FactionData`)                |
| `agents`              | `gameState.agents`              | None                                                                        |
| `missions`            | `gameState.missions`            | `dataTables.offensiveMissions`, `dataTables.defensiveMissions`              |
| `lead investigations` | `gameState.leadInvestigations`  | `dataTables.leads` (ID-only reference)                                      |
| `enemies`             | `gameState.missions[x].enemies` | `dataTables.enemies` (only `EnemyCounts` referenced)                        |
| `weapons`             | Various, see `[1]`              | None                                                                        |

`[1]`: Each type `Actor` has a `Weapon`. `Actor`s are present in following locations in a `gameState`:
- `gameState.agents[x]` - each agent is an actor, and hence has a weapon.
- `gameState.missions[x].enemies[y]` - each enemy is an actor, and hence has a weapon.

// KJA1 document in detail when/how each collection items are instantiated during game session.

// KJA1 also need to talk about `bldWeapon` and sort out the constants for it - for agents (part of the agent data structure, see the other todo), and enemies (part of data table)

// KJA1 factions, should reference factionsData by ID, same as missions and lead investigations. Not copy FactionData properties into it.

// KJA1 all the agent constants should be put into one data structure and used in bldAgent
// Currently Agents use constants (like `AGENT_INITIAL_SKILL`) rather than a data table, as they are created dynamically during gameplay.
