# About collections

The game has several important `collections` of `objects`.

There are several kind of collections in the game and the objects within them, with various properties.

This document describes the collection kinds, the collections themselves, and what are their
initialization conventions.

# Collection types

The game has two main types of collections:

1. **Data tables**: Immutable collections of data that define game concepts. These are stored in the global `dataTables` constant and never change after initialization.

2. **Game state collections**: Mutable collections of entities that represent the current state of the game. These are stored in Redux `gameState` and change as the game progresses.

## Game state collections and their data sources

Game state collections are constructed from data tables using factory functions:

- **`factions`**: Built from `dataTables.factions` by `bldFactions()` in `factionFactory.ts`. Each `Faction` entity is created from `FactionData`.
// KJA1 factions should reference factionsData by ID, same as missions and lead investigations

- **`agents`**: Built by `bldAgent()` in `agentFactory.ts`. Agents use constants (like `AGENT_INITIAL_SKILL`) rather than a data table, as they are created dynamically during gameplay.
// KJA1 all the agent constants should be put into one data structure.

- **`missions`**: Built by `bldMission()` in `missionFactory.ts`. Missions do not require `dataTables.offensiveMissions` or `dataTables.defensiveMissions` directly. They only keep a reference to `missionDataId`, which points to mission data in the data tables. The mission data is looked up when needed via the `missionDataId`.

- **`lead investigations`**: Built by `bldLeadInvestigation()` in `leadInvestigationFactory.ts`. Lead investigations do not require `dataTables.leads` directly. They only keep a reference to `leadId`, and the game state tracks lead investigation counts without mutating the leads themselves.

# Data tables

Data tables are immutable collections of data that define game concepts. They are:
- Populated once during application initialization
- Never modified after initialization
- Stored in the global `dataTables` constant

Data tables contain only data types (like `FactionData`, `LeadData`, `OffensiveMissionData`), not mutable entities. The actual game entities (like `Faction`, `Mission`, `Agent`) are built from this data by `bld*` function in `*factory.ts` files and stored in Redux `gameState`.

For example:
- `dataTables.factions` contains `FactionData[]` - immutable data that defines factions
- `dataTables.leads` contains `LeadData[]` - immutable data that defines leads
- `dataTables.offensiveMissions` and `dataTables.defensiveMissions` contain mission data types

The actual `Faction` entities (which are mutable) are stored in `gameState.factions`, not in `dataTables`.

# Game state collections

Game state collections are mutable collections of entities that represent the current state of the game. They are:
- Stored in Redux `gameState`
- Modified as the game progresses
- Built from data tables by `bld*` function in `*factory.ts` files during game initialization or as the game progresses

For example:
- `gameState.factions` contains `Faction[]` - mutable faction entities
- `gameState.agents` contains `Agent[]` - mutable agent entities
- `gameState.missions` contains `Mission[]` - mutable mission entities
- `gameState.missions[x].enemies` contains `Enemy[]` - mutable enemy entities
- `gameState.leadInvestigations` contains `LeadInvestigation[]` - mutable lead investigation entities

## Collections representation

Collections are represented as arrays:
- **Data tables**: `ConceptData[]` arrays stored in `dataTables` (e.g., `FactionData[]`, `LeadData[]`)
- **Game state collections**: `Concept[]` arrays stored in Redux `gameState` (e.g., `Faction[]`, `Mission[]`, `Agent[]`)

## Accessing collections

Data tables are accessed via the global `dataTables` constant, which is initialized once during application startup. The `dataTables` constant contains all immutable game data and is never modified after initialization.

``` typescript
import { dataTables } from '../lib/data_tables/dataTables'

// Access data tables
const leads = dataTables.leads  // LeadData[]
const factions = dataTables.factions  // FactionData[]
const offensiveMissions = dataTables.offensiveMissions  // OffensiveMissionData[]
```

Game state collections are accessed via Redux state:

``` typescript
import { useAppSelector } from '../redux/hooks'

const gameState = useAppSelector((state) => state.undoable.present.gameState)

// Access game state collections
const factions = gameState.factions  // Faction[]
const agents = gameState.agents  // Agent[]
const missions = gameState.missions  // Mission[]
```

## Factory functions and prototypes

Each unit `bld` function in the `*factory.ts` files codifies the customizable templates (aka prototypes) for each concept. These factory functions define how entities are constructed from data tables and game state:

- `bldFaction(datum: FactionData): Faction` - builds a `Faction` entity from `FactionData`
- `bldAgent(params: CreateAgentParams): Agent` - builds an `Agent` entity with customizable parameters
- `bldMission(params: CreateMissionParams): Mission` - builds a `Mission` entity from mission data
- `bldLeadInvestigation(params: CreateLeadInvestigationParams): LeadInvestigation` - builds a `LeadInvestigation` entity
- `bldEnemy(type: EnemyType, currentIdCounter: number): Enemy` - builds an `Enemy` entity from enemy data
- `bldWeapon(baseDamage: number): Weapon` - builds a `Weapon` entity from weapon data

These factory functions serve as the "prototypes" that define the structure and default values for each entity type.

# Data table implementation

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

# Full list of collections

## Data tables (immutable)

| Data Table                     | Type                                    | Location                    |
|--------------------------------|-----------------------------------------|-----------------------------|
| `faction operation level defs` | `FactionOperationLevelData[]`          | `dataTables.factionOperationLevels` |
| `offensive mission defs`       | `OffensiveMissionData[]`                | `dataTables.offensiveMissions` |
| `defensive mission defs`       | `DefensiveMissionData[]`                | `dataTables.defensiveMissions` |
| `faction activity level defs` | `FactionActivityLevelData[]`            | `dataTables.factionActivityLevels` |
| `enemies`                      | `EnemyData[]`                           | `dataTables.enemies` |
| `leads`                        | `LeadData[]`                            | `dataTables.leads` |
| `factions`                     | `FactionData[]`                         | `dataTables.factions` |

## Game state collections (mutable)

| Collection                     | Type                                    | Location                    | Built from                    |
|--------------------------------|-----------------------------------------|-----------------------------|-------------------------------|
| `factions`                     | `Faction[]`                             | Redux `gameState.factions`  | `dataTables.factions` via `bldFactions()` |
| `agents`                       | `Agent[]`                               | Redux `gameState.agents`    | Constants via `bldAgent()` |
| `missions`                     | `Mission[]`                              | Redux `gameState.missions`  | Built via `bldMission()` (references `missionDataId` from `dataTables.offensiveMissions` or `dataTables.defensiveMissions`) |
| `lead investigations`          | `LeadInvestigation[]`                   | Redux `gameState.leadInvestigations` | Built via `bldLeadInvestigation()` (references `leadId` from `dataTables.leads`) |

// KJA1 also need to mention here `enemies` per `mission[x]`
// KJA1 also need to talk about `bldWeapon` and sort out the constants for it - for agents (part of the agent data structure, see the other todo), and enemies (part of data table)

# Full list of data tables

All data tables are accessible via the `dataTables` constant:

| Data Table                    | Type                                    | Builder Function                      |
|-------------------------------|-----------------------------------------|---------------------------------------|
| `factions`                    | `FactionData[]`                         | `bldFactionsTable()`                  |
| `leads`                       | `LeadData[]`                            | `bldLeadsTable(factions)`             |
| `offensiveMissions`           | `OffensiveMissionData[]`                | `bldOffensiveMissionsTable(factions)` |
| `defensiveMissions`           | `DefensiveMissionData[]`                | `bldDefensiveMissionsTable(factions)` |
| `factionActivityLevels`       | `FactionActivityLevelData[]`            | `bldActivityLevelsTable()`            |
| `factionOperationLevels`      | `FactionOperationLevelData[]`           | `bldFactionOperationLevelsTable()`    |
| `enemies`                     | `EnemyData[]`                           | `bldEnemiesTable()`                   |

All data tables are located in `web/src/lib/data_tables/` and are built by `bldDataTables()` in `web/src/lib/data_tables/dataTables.ts`.

Factory functions that build game state entities from data tables are located in `web/src/lib/factories/`:
- `factionFactory.ts` - `bldFactions()`, `bldFaction()`
- `agentFactory.ts` - `bldAgent()`
- `missionFactory.ts` - `bldMission()`
- `leadInvestigationFactory.ts` - `bldLeadInvestigation()`
- `enemyFactory.ts` - `bldEnemies()`
- `weaponFactory.ts` - `bldWeapon()`

Each unit `bld` function in the `*factory.ts` files codifies the customizable templates (aka prototypes) for each concept, defining how entities are constructed from data tables and game state.
