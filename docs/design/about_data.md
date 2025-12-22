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

| Collection(s)         | Location                                  | Data tables referenced by `bld<entity>` functions from `<entity>factory.ts` |
| --------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `factions`            | `gameState.factions`                      | `dataTables.factions`                                                       |
| `agents`              | `gameState.agents`                        | None                                                                        |
| `missions`            | `gameState.missions`                      | `dataTables.offensiveMissions`, `dataTables.defensiveMissions`              |
| `lead investigations` | `gameState.leadInvestigations`            | `dataTables.leads`                                                          |
| `enemies`             | `gameState.missions[x].enemies`           | None                                                                        |
| `weapons`             | `gameState.agents[x].weapon`,             |                                                                             |
|                       | `gameState.missions[x].enemies[y].weapon` | None                                                                        |

// KJA2 document in detail when/how each collection items are instantiated during game session.
// For example:
// - During game initialization, as part of initial game state:
//   - factions are constructed
//   - agents are constructed
//   - ...
// - During game session:
// - agent is constructed when when "hire agent" player action is invoked.
// - lead investigation is constructed when "investigate lead" player action is invoked.
// - mission is constructed when ...
//
// Clarify that factions are special case as the collection doesn't mutate during game session.

// KJA2 also need to talk about `bldWeapon` and sort out the constants for it - for agents (part of the agent data structure, see the other todo), and enemies (part of data table)
