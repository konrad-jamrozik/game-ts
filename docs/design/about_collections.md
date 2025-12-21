# About game state collections

- [About game state collections](#about-game-state-collections)

The `game state collections` are mutable collections of entities that represent the current state of the game.

They are one of the two main categories of game data, the other being immutable data tables.
Refer to [`about_data.md`](about_data.md) for more details.

`game state collections` are:
- Stored in various properties of the `gameState`. See `gameStateModel.ts / GameState`.
- Populated with initial data when new game starts, as well as updated during the game as the game progresses.
- Modified as the game progresses - the actual Redux root reducer is a series of undoable snapshots of the `gameState`,
  one per turn. See `rootReducer.ts / rootReducer`.

Each `game state collection`:
- Is of type `Entity[]`. The `Entity` is a `Concept` that is mutable - it can be modified during the game.
  E.g. `Agent` entity has hit points, state and few other properties mutable.
- Is of variable length - entities can be added to them.
  The entities cannot be removed. Instead, existing entities must be mutated to mark they have been effectively removed.
- Built from current turn `gameState` and optionally `data tables` by `bld<entity>` functions in `<entity>factory.ts` files.

# Accessing game state collections

Game state collections are accessed via Redux state:

``` typescript
import { useAppSelector } from '../redux/hooks'

const gameState = useAppSelector((state) => state.undoable.present.gameState)

// Access game state collections
const factions = gameState.factions  // Faction[]
const agents = gameState.agents  // Agent[]
const missions = gameState.missions  // Mission[]
```

# Construction of game state collections

Game state collections are constructed by `web/src/lib/factories/<entity>Factory.ts` files, by `bld<entity>` functions.

Each unit `bld` function in the `*factory.ts` files codifies the customizable templates (aka prototypes) for each concept, defining how entities are constructed from data tables and game state.

## Game state collections and their data sources

# Game state collections - construction

Game state collections are constructed from data tables and current turn game state using factory functions:

- **`factions`**: Built from `dataTables.factions` by `bldFactions()` in `factionFactory.ts`. Each `Faction` entity is created from `FactionData`.
// KJA1 factions should reference factionsData by ID, same as missions and lead investigations

- **`agents`**: Built by `bldAgent()` in `agentFactory.ts`. Agents use constants (like `AGENT_INITIAL_SKILL`) rather than a data table, as they are created dynamically during gameplay.
// KJA1 all the agent constants should be put into one data structure.

- **`missions`**: Built by `bldMission()` in `missionFactory.ts`. Missions do not require `dataTables.offensiveMissions` or `dataTables.defensiveMissions` directly. They only keep a reference to `missionDataId`, which points to mission data in the data tables. The mission data is looked up when needed via the `missionDataId`.

- **`lead investigations`**: Built by `bldLeadInvestigation()` in `leadInvestigationFactory.ts`. Lead investigations do not require `dataTables.leads` directly. They only keep a reference to `leadId`, and the game state tracks lead investigation counts without mutating the leads themselves.

Factory functions that build game state entities based on data tables and current game state are located in `web/src/lib/factories/`:
- `factionFactory.ts` - `bldFactions()`, `bldFaction()`
- `agentFactory.ts` - `bldAgent()`
- `missionFactory.ts` - `bldMission()`
- `leadInvestigationFactory.ts` - `bldLeadInvestigation()`
- `enemyFactory.ts` - `bldEnemies()`
- `weaponFactory.ts` - `bldWeapon()`

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

## Factory functions and prototypes

Each unit `bld` function in the `*factory.ts` files codifies the customizable templates (aka prototypes) for each concept. These factory functions define how entities are constructed from data tables and game state:

- `bldFaction(datum: FactionData): Faction` - builds a `Faction` entity from `FactionData`
- `bldAgent(params: CreateAgentParams): Agent` - builds an `Agent` entity with customizable parameters
- `bldMission(params: CreateMissionParams): Mission` - builds a `Mission` entity from mission data
- `bldLeadInvestigation(params: CreateLeadInvestigationParams): LeadInvestigation` - builds a `LeadInvestigation` entity
- `bldEnemy(type: EnemyType, currentIdCounter: number): Enemy` - builds an `Enemy` entity from enemy data
- `bldWeapon(baseDamage: number): Weapon` - builds a `Weapon` entity from weapon data

These factory functions serve as the "prototypes" that define the structure and default values for each entity type.
