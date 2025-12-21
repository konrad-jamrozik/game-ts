# About data tables

- [About data tables](#about-data-tables)
- [Accessing `dataTables`](#accessing-datatables)
- [Construction of `dataTables`](#construction-of-datatables)

The `data tables` are immutable collections of data that define game concepts.

They are one of the two main categories of game data, the other being game state collections.
Refer to [`about_data.md`](about_data.md) for more details.

`data tables` are:
- Populated once during application initialization and stored in the global `dataTables` constant.
  See `dataTables.ts / dataTables`.
- Never modified after initialization.
- Populated from a human-readable table layout in the `*DataTable.ts` files.
- Used as input to instantiate `game state collections` during game initialization and runtime.

Each `data table`:
- Is a property of `dataTables`, e.g. `dataTables.factions`.
- Is of type `<Concept>Data[]`, e.g. `FactionData[]`.
- Is built in the `conceptsDataTable.ts` file by the `bld<concepts>Table()` function, e.g.:
  - `bldEnemiesTable()` in `enemiesDataTable.ts`
- The `bld<concepts>Table()` function is a factory function that builds the data table from a human-readable table layout.
  It internally calls the `to<concepts>DataTable()` function to build the data table. E.e.g `toEnemiesDataTable()`.

# Accessing `dataTables`

Data tables are accessed via the global `dataTables` constant, which is initialized once during application startup.

``` typescript
import { dataTables } from '../lib/data_tables/dataTables'

// Access data tables
const leads = dataTables.leads  // LeadData[]
const factions = dataTables.factions  // FactionData[]
const offensiveMissions = dataTables.offensiveMissions  // OffensiveMissionData[]
```

# Construction of `dataTables`

The `web/src/lib/data_tables/dataTables.ts / dataTables` is populated by the static `bldDataTables()` function.
That function invokes various `bld*DataTable()` functions from `web/src/lib/data_tables/<concepts>DataTable.ts`
to construct the `dataTables` constant.

Each such `<concepts>DataTable.ts` file exports a builder function of the form:

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

The first defined element is always the `export function bldConceptsTable(...)` builder function,
followed by `export type ConceptData`, then the internal helper functions and types.
