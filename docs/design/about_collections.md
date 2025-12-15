# About collection s

The game has several important `collections` of `objects`.

There are several kind of collections in the game and the objects within them, with various properties.

This document describes the collection kinds, the collections themselves, and what are their
initialization conventions.

# Object kinds

The `objects` within collections are either `entities` or `definitions`.
- `entities` represent a game concept visible to the player and can be mutated over time as game progresses.
- `definitions` are static objects that are used to instantiate entities during the game.
  They are not visible to the player.

Examples of `entities` are `agents` or `mission sites`.
An Example of a `definition` is a `mission site definition`.

# Collection kinds

## Constant collections

Each `constant collection`:
- Can have either `entities` or `definitions` as elements.
- Is populated with elements once and fully, during game initialization.
- Has static contents that cannot change over the course of the game.
  I.e. once instantiated, no objects are ever added or removed. Albeit conceptually objects may be removed from the game,
  e.g. when a player terminates a faction, the corresponding object in the `factions constant collection`
  is marked as terminated, but not removed from the collection.

For example:
- `factions` is a `constant entity collection`.
- `leads` is a `constant entity collection`.
- `mission site definitions` is a `constant definition collection`.

## Variable collections

Each `variable collection`:
- Can have only `entities` as elements.
- Is populated with some initial elements during game initialization.
- May have elements added to it during the course of the game, at various turns, but no elements are ever removed from it.

For example:
- `agents` is a `variable entity collection`.
- `mission sites` is a `variable entity collection`.
- `lead investigations` is a `variable entity collection`.

# Full list of collections and objects

- `factions`: `constant entity collection`
- `faction activity levels`: `constant entity collection` (need to verify)
- `faction operation levels`: `constant definition collection` (need to verify)
- `mission site definitions`: `constant definition collection`
- `mission sites`: `variable entity collection`
- `leads`: `constant entity collection`
- `lead investigations`: `variable entity collection`
- `agents`: `variable entity collection`

# Full list of data tables

- `leads DataTable`
- `enemiesData Table`
- `defensiveMissionSites DataTable`
- `offensiveMissionSites DataTable`
- `factions DataTable`
- `factionOperationLevel DataTable`
- `factionOperationRoll DataTable`
- `factionActivityLevel DataTable`
- `factionActivityLevelProgression DataTable`

# Full list of prototypes

- `initial GameState Prototype`
- `debug GameState Prototype`
- `missionSite Prototype`
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
A mission site is built based on:
- Current turn state
- Mission site definition
- Its prototype
