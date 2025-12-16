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
- `factions` is a `constant entity collection`.
- `leads` is a `constant entity collection`.
- `mission definitions` is a `constant definition collection`.

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

Collections are represented either as `Concept[]` or `Record<ConceptLevel, Concept>`.

In all cases they are constructed from appropriate input data tables, like that:

``` typescript
export const concepts: Concept[] = toConceptsCollection(CONCEPTS_DATA_TABLE)

export const concepts: Record<ConceptLevel, Concept> = toConceptsCollection(CONCEPTS_DATA_TABLE)
```

For example:

``` typescript
export const leads: Lead[] = toLeadsCollection(CONCEPTS_DATA_TABLE)

export const factionActivityLevelDefs: Record<ActivityLevelOrd, ActivityLevelDef> = toFactionActivityLevelDefsCollection(FACTION_ACTIVITY_LEVEL_DATA_TABLE)
```

Existing code that needs rework:

``` typescript
export const factions: Faction[] = toFactions(FACTION_DATA)

export const offensiveMissionDefs: MissionDef[] = FACTION_DATA.flatMap((faction) => bldMissionDefsForFaction(faction))

export const defensiveMissionDefs: MissionDef[] = FACTION_DATA.flatMap((faction) =>
  bldDefensiveMissionDefsForFaction(faction),
)

export const leads: Lead[] = toLeads(LEADS_DATA)

export const ACTIVITY_LEVEL_CONFIGS: Record<ActivityLevel, ActivityLevelConfig> = {
  0: bldActivityLevelConfig(0),
  1: bldActivityLevelConfig(1),
  2: bldActivityLevelConfig(2),
  3: bldActivityLevelConfig(3),
  4: bldActivityLevelConfig(4),
  5: bldActivityLevelConfig(5),
  6: bldActivityLevelConfig(6),
  7: bldActivityLevelConfig(7),
}

```

## Pending refactoring

| Name                              | Symbol                                      | TODO                |
|-----------------------------------|---------------------------------------------|----------------------|
| `leads`                           | LEADS_DATA                                  | Rename to LEADS_DATA_TABLE                     |
| `enemies`                         | ENEMY_STATS_DATA                            | Rename to ENEMIES_DATA_TABLE                     |
| `defensiveMissions`               | DEFENSIVE_MISSIONS_DATA                     | Rename to DEFENSIVE_MISSIONS_DATA_TABLE                     |
| `offensiveMissions`               | OFFENSIVE_MISSIONS_DATA                     | Rename to OFFENSIVE_MISSIONS_DATA_TABLE                     |
| `factions`                        | FACTION_DATA                                | Rename to FACTIONS_DATA_TABLE                     |
| `factionOperationLevel`           | OPERATION_LEVEL_STATS_DATA                  | Per operation level  |
| `factionOperationRoll`            | FACTION_OPERATION_ROLL_PROBABILITY_DATA     | Per activity level   |
| `factionActivityLevelConfig`      | ACTIVITY_LEVEL_CONFIGS                      | Per activity level   |
| `factionActivityLevel`            | type ActivityLevel                          |                      |
| `factionActivityLevelName`        | type ActivityLevelName                      | Per activity level   |
| `factionActivityLevelProgression` | FACTION_ACTIVITY_LEVEL_PROGRESSION_DATA     | Per activity level   |

# Data tables

The collections populated during game initialization are populated from hardcoded data tables.

Data tables are located in `web/src/lib/collections/<concepts>DataTable.ts` files,
e.g. `leadsDataTables.ts`.

## Data table construction

Each data table is constructed and exposed as a constant of form:

``` typescript
export const CONCEPTS_DATA_TABLE: ConceptData[] = toConceptsDataTable([
  //  Col1 header,    Col2 header,     Col3 header,  ...
  [row1_col1_val], [row1_col2_val], [row1_col3_val], ...
  [row2_col1_val], [row2_col2_val], [row2_col3_val], ...
  ...
])
```

e.g.
``` typescript
export const LEADS_DATA_TABLE: LeadData[] = toLeadsDataTable([
  ...
])
```

The `toConceptsData` function takes as input `ConceptDataRow[]` and returns `ConceptData[]`.

The supporting symbols, like `toConceptsData` function or `type ConceptDataRow` are defined at the bottom of the same file.
They are not exported.

The first defined element is always the `export const CONCEPTS_DATA_TABLE: ConceptData[]` and below it, `export type ConceptData`.

# Full list of collections and objects

| Collection                     | Variability | Object Type | Notes                    |
|--------------------------------|-------------|-------------|--------------------------|
| `faction operation level defs` | constant    | definition  |                          |
| `offensive mission defs`       | constant    | definition  |                          |
| `defensive mission defs`       | constant    | definition  |                          |
| `faction activity level defs`  | constant    | definition  |                          |
| `factions`                     | constant    | entity      |                          |
| `leads`                        | constant    | entity      |                          |
| `lead investigations`          | variable    | entity      |                          |
| `agents`                       | variable    | entity      |                          |
| `missions`                     | variable    | entity      |                          |

# Full list of data tables

TODO

# Full list of prototypes

- `initial GameState Prototype`
- `debug GameState Prototype`
- `mission Prototype`
- `leadInvestigation Prototype`
- `agent Prototype`
- `weapon Prototype`

# TODOs

KJA3 add concept of "agent prototype" used in bldAgent and document it in collections doc.
Also similar for weapon prototype, initial state, debug state, init capabilities prototype
Actually, initial state prototype is just a composite of other prototypes.
When an agent is built, it is built based on the prototype + current turn game state.
A lead definition is built based on:
- Current turn state, e.g. ID, agents to assign, lead it pertains to
- Prototype, e.g. the fact it is "Active"
A mission is built based on:
- Current turn state
- Mission definition
- Its prototype
