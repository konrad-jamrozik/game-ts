# Write an AI player and interface for it

Write a plan how to add "AI Player" feature to the game.

Key components of it:
- The UI allowing the human player to invoke the API player
- The implementation of the AI player interface to the rest of the app
- The implementation of the AI player intellects

## The UI for AI player

In "Game controls" component, add another section at the bottom, "AI player", with following elements:

- A dropdown to choose "AI player intellect"
- A button "Delegate to AI" that makes the AI player execute all the actions it wants to execute
  in the given turn according to the chosen intellect, and then advances the turn,
  if possible (it won't be possible is game is over).

## The AI player API

The AI player API is as follows:
- It is implemented in web/src/lib/ai/
- When a player clicks "Delegate to AI" it is routed to function that obtains appropriate `AIPlayerIntellect` from the `intellectRegistry`
  and launches `playTurn` function. That function can be called `delegateTurnToAIPlayer`.
- The `playTurn` function is implemented within the intellect itself, according to the `AIPlayerIntellect` type.
- The `playTurn` functions allows the intellect implementing it to repeatedly inspect current turn `gameState`, and invoke all the same
  actions a human player could invoke, read the updated `gameState`, and repeat until the intellect decides it doesn't want to do anything else
  in the turn and returns.
- Then the control comes back to `delegateTurnToAIPlayer` function which advances the game turn, if possible (i.e. it is not game over).

### Implementation details: Accessing Redux store from AI player

The AI player can access the Redux store directly (outside React components) to read state and dispatch actions:

**Type definitions:**
```typescript
// web/src/lib/ai/types.ts
import type { GameState } from '../../model/gameStateModel'
import type { AppDispatch } from '../../redux/store'

export type AIPlayerIntellect = {
  playTurn: (getState: () => GameState, dispatch: AppDispatch) => Promise<void> | void
}
```

**Main delegation function:**
```typescript
// web/src/lib/ai/delegateTurnToAIPlayer.ts
import { store } from '../../redux/store'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { isGameOver } from '../../lib/game_utils/gameStateChecks'
import type { AIPlayerIntellect } from './types'

export function delegateTurnToAIPlayer(intellect: AIPlayerIntellect): void {
  // Provide functions to read state and dispatch actions
  const getState = () => store.getState().undoable.present.gameState
  const dispatch = store.dispatch
  
  // Let the intellect play its turn
  intellect.playTurn(getState, dispatch)
  
  // After intellect is done, advance turn if game is not over
  const finalState = getState()
  if (!isGameOver(finalState)) {
    dispatch(advanceTurn())
  }
}
```

**Example: "Do Nothing" intellect:**
```typescript
// web/src/lib/ai/intellects/doNothingIntellect.ts
import type { AIPlayerIntellect } from '../types'

export const doNothingIntellect: AIPlayerIntellect = {
  playTurn: () => {
    // Does nothing, just returns
  }
}
```

**Example: "Basic" intellect (skeleton):**
```typescript
// web/src/lib/ai/intellects/basicIntellect.ts
import { hireAgent, assignAgentsToContracting } from '../../redux/slices/gameStateSlice'
import { AGENT_HIRE_COST } from '../../lib/data_tables/constants'
import { available } from '../../lib/model_utils/agentUtils'
import type { AIPlayerIntellect } from '../types'

export const basicIntellect: AIPlayerIntellect = {
  playTurn: (getState, dispatch) => {
    const state = getState()
    
    // Make decisions and dispatch actions
    if (state.money >= AGENT_HIRE_COST && state.agents.length < state.agentCap) {
      dispatch(hireAgent())
    }
    
    // Read updated state (Redux updates synchronously)
    const updatedState = getState()
    
    // Make more decisions based on updated state
    const availableAgents = available(updatedState.agents)
    if (availableAgents.length > 0) {
      const agentIds = availableAgents.slice(0, 3).map(a => a.id)
      dispatch(assignAgentsToContracting(agentIds))
    }
    
    // Can continue making decisions and dispatching actions...
    // The state is always up-to-date after each dispatch
  }
}
```

**Key points:**
- The Redux store is exported from `web/src/redux/store.ts` and can be accessed directly
- Game state is at `store.getState().undoable.present.gameState` (wrapped in undoable reducer)
- All player actions from `gameStateSlice.ts` are available (hireAgent, assignAgentsToContracting, deployAgentsToMission, etc.)
- Redux updates are synchronous - after `dispatch()`, the state is immediately updated
- No React hooks needed - the AI code uses `store.getState()` and `store.dispatch()` directly

## The AI player intellects

Two intellects at first:

- "Do nothing" intellect, that always just advances the turn, that's it.
- "Basic" intellect, as described below.

### Basic intellect

The "basic" AI player intellect should be able to:
- Have the basic capability to read game state and act on it, as described above.
- Make good decision about:
  - agents: when to fire, hire, what to assign them to, including
    lead investigations, training, and mission deployments.
  - Which lead to investigate, which mission to deploy agents to, how much, and so on.
  - Which capabilities to upgrade and when.
  - Which factions to focus on, to suppress them enough so panic doesn't reach 100% and thus game ends.
