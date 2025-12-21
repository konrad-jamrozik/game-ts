# About collections

The game has several important `collections` of `objects`.

There are several kind of collections in the game and the objects within them, with various properties.

This document describes the collection kinds, the collections themselves, and what are their
initialization conventions.

# Object kinds

The `objects` within collections are either `entities` or `definitions`.
- `entities` represent a game concept visible to the player and can be mutated over time as game progresses.
- `definitions` are immutable objects that are used to instantiate entities during the game.
  They are not visible to the player.

Examples of `entities` are `agents` or `missions`.
An Example of a `definition` is a `mission definition`.
// KJA1 drop the 'definition' and 'entity' concept. Instead of `constant definition collection` we have `data tables` and `game state collections`.
// Clarify which `game state collections` are constructed from which `data tables`. Specifically:
// -  `factions` are build from `dataTables.factions` by `bldFactions()` from `factionFactory.ts`
// - `agents` are build from `dataTables.agents` by `bldAgents()` from `agentFactory.ts`
// - `missions` are build from `dataTables.missions` by `bldMission()` from `missionFactory.ts`
// - `lead investigations` are built by `bldLeadInvestigation()` from `leadInvestigationFactory.ts`, but they uniquely do not require `dataTables.leads`.
//   This is because they just keep a reference to `leadId`, and the game state just keeps track of lead investigation counts, doesn't mutate any leads.

# Collection kinds

## Constant collections

Each `constant collection`:
- Can have either `entities` or `definitions` as elements.
- Is populated with elements once and fully, during game initialization. From `data tables`.
- Has static contents that cannot change over the course of the game.
  I.e. once instantiated, no objects are ever added or removed. Albeit conceptually objects may be removed from the game,
  e.g. when a player terminates a faction, the corresponding object in the `factions constant collection`
  is marked as terminated, but not removed from the collection.

For example:
- `factions` is a `constant entity collection` (stored in `dataTables.factions` as `FactionData[]`). // KJA1 this is not correct, the data tables do not store entities, as entities are mutable. The faction entities are in game state.
- `leads` is a `constant definition collection` (stored in `dataTables.leads` as `LeadData[]`).
- `mission definitions` (offensive and defensive) are `constant definition collections` (stored in `dataTables.offensiveMissions` and `dataTables.defensiveMissions`).

## Variable collections

Each `variable collection`:
- Can have only `entities` as elements.
- Is populated with some initial elements during game initialization. From `data tables`.
- May have elements added to it during the course of the game, at various turns, but no elements are ever removed from it.

For example:
- `agents` is a `variable entity collection`.
- `missions` is a `variable entity collection`.
- `lead investigations` is a `variable entity collection`.

## Collections construction

Collections are represented as `Concept[]` arrays. // KJA1 this must be clarified that ConceptData[] is in dataTables while Concept[] is in game state.

Constant definition collections are accessed via the global `dataTables` constant, which is initialized once during application startup.
The `dataTables` constant contains all immutable game data and is never modified after initialization.

For example:

``` typescript
import { dataTables } from '../lib/data_tables/dataTables'

// Access constant definition collections
const leads = dataTables.leads
const factions = dataTables.factions
const offensiveMissions = dataTables.offensiveMissions
```

Entity collections with runtime state (like `Mission`, `Agent`, `LeadInvestigation`) are stored in Redux state and are built from data tables during game initialization or as the game progresses.

# Data tables

The collections populated during game initialization are populated from hardcoded data tables.

Data tables are located in `web/src/lib/data_tables/<concepts>DataTable.ts` files,
e.g. `leadsDataTable.ts`.

## Centralized dataTables constant

All data tables are centralized in a single `dataTables` constant defined in `web/src/lib/data_tables/dataTables.ts`. This constant is initialized once via `bldDataTables()` and contains all immutable game data. The data is never modified after initialization.

``` typescript
export const dataTables: DataTables = bldDataTables()

export function bldDataTables(): DataTables {
  const enemies = bldEnemiesTable()
  const factionOperationLevels = bldFactionOperationLevelsTable()
  const factionActivityLevels = bldFactionActivityLevelsTable()
  const factions = bldFactionsTable()

  const leads = bldLeadsTable(factions)
  const offensiveMissions = bldOffensiveMissionsTable(factions)
  const defensiveMissions = bldDefensiveMissionsTable(factions)

  return {
    factions,
    leads,
    offensiveMissions,
    defensiveMissions,
    factionActivityLevels,
    enemies,
    factionOperationLevels,
  }
}
```

Template expansion (e.g., `{facId}`, `{facName}`) happens during initialization in `bldDataTables()`. The function calls individual data table builders in the correct order, and those builders handle template expansion as needed.

## Data table construction

Each data table file exports a builder function of the form:

``` typescript
export function bldConceptsTable(...args): readonly ConceptData[] {
  return toConceptsDataTable([
    //  Col1 header,    Col2 header,     Col3 header,  ...
    [row1_col1_val], [row1_col2_val], [row1_col3_val], ...
    [row2_col1_val], [row2_col2_val], [row2_col3_val], ...
    ...
  ], ...args)
}
```

e.g.
``` typescript
export function bldLeadsTable(factions: readonly FactionData[]): readonly Lead[] {
  return toLeadsDataTable([
    ...
  ], factions)
}
```

The `toConceptsDataTable` function takes as input `ConceptDataRow[]` and returns `ConceptData[]`.

The supporting symbols, like `toConceptsDataTable` function or `type ConceptDataRow` are defined at the bottom of the same file.
They are not exported.

The first defined element is always the `export function bldConceptsTable(...)` builder function, followed by `export type ConceptData`, then the internal helper functions and types.

# Full list of collections and objects

| Collection                     | Variability | Object Type | Location                    |
|--------------------------------|-------------|-------------|-----------------------------|
| `faction operation level defs` | constant    | definition  | `dataTables.factionOperationLevels` |
| `offensive mission defs`       | constant    | definition  | `dataTables.offensiveMissions` |
| `defensive mission defs`       | constant    | definition  | `dataTables.defensiveMissions` |
| `faction activity level defs`  | constant    | definition  | `dataTables.factionActivityLevels` |
| `enemies`                      | constant    | definition  | `dataTables.enemies` |
| `leads`                        | constant    | definition  | `dataTables.leads` |
| `factions`                     | constant    | entity      | `dataTables.factions` |
| `lead investigations`          | variable    | entity      | Redux `gameState` |
| `agents`                       | variable    | entity      | Redux `gameState` |
| `missions`                     | variable    | entity      | Redux `gameState` |

# Full list of data tables

All data tables are accessible via the `dataTables` constant:

| Data Table                    | Type                                    | Builder Function                    |
|-------------------------------|-----------------------------------------|-------------------------------------|
| `factions`                    | `FactionData[]`                        | `bldFactionsTable()`                |
| `leads`                       | `LeadData[]`                           | `bldLeadsTable(factions)`           |
| `offensiveMissions`           | `OffensiveMissionData[]`                | `bldOffensiveMissionsTable(factions)` |
| `defensiveMissions`           | `DefensiveMissionData[]`                | `bldDefensiveMissionsTable(factions)` |
| `factionActivityLevels`       | `FactionActivityLevelData[]`           | `bldActivityLevelsTable()`          |
| `factionOperationLevels`      | `FactionOperationLevelData[]`          | `bldFactionOperationLevelsTable()`  |
| `enemies`                     | `EnemyData[]`                          | `bldEnemiesTable()`                 |

All data tables are located in `web/src/lib/data_tables/` and are built by `bldDataTables()` in `web/src/lib/data_tables/dataTables.ts`.

// KJA1 mention that each unit `bld` function in the `*factory.ts` files codify the customizable templates aka prototypes for each concept.
