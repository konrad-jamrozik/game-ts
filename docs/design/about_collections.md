# About game state collections

- [About game state collections](#about-game-state-collections)
- [Accessing game state collections](#accessing-game-state-collections)
- [Construction of game state collections](#construction-of-game-state-collections)
  - [Game state collection construction code pattern](#game-state-collection-construction-code-pattern)

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

Each game state collection is constructed:
- By using as input current turn `gameState` and optionally `data tables`.
- By corresponding `web/src/lib/factories/<entity>Factory.ts` file `bld<entity>` function.
  E.g. an `agent` entity added to `gameState.agents` is constructed by `bldAgent()` in `agentFactory.ts`.

Each `bld<entity>` function codifies the customizable templates (aka prototypes) for each entity type.
As such, each entity is constructed using following components:
- The customizable template codified in the `bld<entity>` function.
- The construction logic in the `bld<entity>` function.
- The input arguments passed to the function, derived from current turn `gameState`
- Optionally relevant data table in `dataTables`

## Game state collection construction code pattern

Each `<entity>Factory.ts` file exports a builder function of the form:
``` typescript
export function bldEntity(params: CreateEntityParams): Entity {
  return {
    ...params,
  }
}

type CreateEntityParams = {
  // ...values from current game state
}

```

e.g.

``` typescript
export function bldAgent(params: CreateAgentParams): Agent {
  return {
    ...params,
  }
}

type CreateAgentParams = {
  // ...
}

```
