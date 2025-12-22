# About game state collections

- [About game state collections](#about-game-state-collections)
- [Accessing game state collections](#accessing-game-state-collections)
- [Construction of game state collections](#construction-of-game-state-collections)
  - [Example: `bldAgent()`](#example-bldagent)
  - [Symbol order in factory files](#symbol-order-in-factory-files)

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
- By using as input current turn `gameState` and optionally relevant `data tables`.
- By corresponding `web/src/lib/factories/<entity>Factory.ts` file `bld<entity>` function.
  E.g. an `agent` entity added to `gameState.agents` is constructed by `bldAgent()` in `agentFactory.ts`.

The factory function returns the entity object; the caller is responsible for adding it to state.

Each `bld<entity>` function in the `<entity>Factory.ts` file codifies the customizable templates (aka prototypes)
for each entity type. As such, each entity is constructed using following components:
- A prototype constant (e.g., `initialAgent`) with all default values
- The construction logic in the `bld<entity>` function that starts with the prototype and applies overrides,
  coming from the `bld<entity>` function parameters, and possibly referencing relevant `data tables`.
- Performs post-processing (ID generation, state derivation, invariant checks)
- Returns the entity object (does NOT mutate state)

The caller is responsible for:
- Either passing the collection count to the builder function as a parameter (e.g., `state.agents.length`),
  which allows it to derive the correct numeric ID of the to-be-built entity, OR providing a custom ID.
  The type system enforces that exactly one of these must be provided (XOR constraint).
- Adding the returned entity to the appropriate collection in current turn `gameState`.

## Example: `bldAgent()`

``` typescript
/**
 * Prototype agent with all default values.
 * Used as a reference for initial agent properties.
 */
export const initialAgent: Agent = {
  id: 'agent-ini' as AgentId,
  turnHired: 1,
  state: 'Available',
  assignment: 'Standby',
  // ... all the other default values ...
}

type CreateAgentParams =
  | (BaseCreateAgentParams & { agentCount: number; id?: never })
  | (BaseCreateAgentParams & { id: Agent['id']; agentCount?: never })

type BaseCreateAgentParams = Partial<Omit<Agent, 'id'>>

/**
 * Creates a new agent object.
 * Returns the created agent. The caller is responsible for adding it to state.
 *
 * The `CreateAgentParams` type enforces an XOR constraint: either `agentCount` OR `id` must be provided,
 * but not both. This ensures type safety at compile time:
 * - If `agentCount` is provided, the ID will be auto-generated from the count
 * - If `id` is provided, the count-based ID generation is disabled
 */
export function bldAgent(params: CreateAgentParams): Agent {
  const { agentCount, ...agentOverrides } = params

  // Start with initialAgent and override with provided values
  const agent: Agent = {
    ...initialAgent,
    ...agentOverrides,
  }

  // Generate ID if not provided
  if (agent.id === initialAgent.id) {
    assertDefined(agentCount, 'Agent count must be provided if ID is not provided')
    agent.id = formatAgentId(agentCount)
  }

  // ... any other post-processing logic and invariant checks ...

  return agent
}
```

Usage examples:

**Using count-based ID generation (most common):**
``` typescript
const newAgent = bldAgent({
  agentCount: state.agents.length,
  turnHired: state.turn,
  weapon: bldWeapon({ damage: state.weaponDamage }),
  state: 'InTransit',
  assignment: 'Standby',
})
state.agents.push(newAgent)
```

**Using custom ID:**
``` typescript
const newAgent = bldAgent({
  id: 'agent-9007' as AgentId,
  turnHired: state.turn,
  weapon: bldWeapon({ damage: state.weaponDamage }),
  state: 'InTransit',
  assignment: 'Standby',
})
state.agents.push(newAgent)
```

**Note:** The type system prevents providing both `agentCount` and `id` simultaneously, enforcing the XOR constraint at compile time.

## Symbol order in factory files

Factory files follow a consistent symbol definition order:

1. **Exported prototype constants** (if applicable) - e.g., `export const initialAgent`, `export const initialWeapon`
2. **Type definitions** - e.g., `type CreateAgentParams`, `export type CreateWeaponParams`
   - Defined before the builder function that uses them
3. **Exported builder function** - `export function bld<Entity>()`
   - The main exported function that constructs entities
4. **Helper functions** (if any) - internal helper functions
   - Defined below their callers (following the project's function layout convention)

Example structure:
``` typescript
// 1. Prototype constant
export const initialAgent: Agent = { ... }

// 2. Param type definition
type CreateAgentParams = { ... }

// 3. Builder function using the param type and prototype constant
export function bldAgent(params: CreateAgentParams): Agent { ... }
```
