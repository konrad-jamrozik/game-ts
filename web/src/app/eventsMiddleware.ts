import type { Middleware } from '@reduxjs/toolkit'
import { ActionCreators } from 'redux-undo'
import { addEvent } from '../model/eventsSlice'
import { advanceTurn, hireAgent, reset, sackAgents, assignAgentsToContracting } from '../model/gameStateSlice'
import type { RootState } from './store'

// Type guard for action
// Redux actions are defined by having "type" property of type "string".
function hasType(obj: unknown): obj is { type: string } {
  return typeof obj === 'object' && obj !== null && 'type' in obj && typeof (obj as { type: unknown }).type === 'string'
}

export function eventsMiddleware(): Middleware<object, RootState> {
  return (store) => (next) => (action) => {
    // Call the next middleware/reducer first to update the state
    const result = next(action)

    // Get the updated state
    const state = store.getState()
    const { gameState } = state.undoable.present

    // Dispatch events based on the action
    // eslint-disable-next-line unicorn/prefer-regexp-test
    if (advanceTurn.match(action)) {
      store.dispatch(
        addEvent({
          message: `Turn ${gameState.turn} started`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (hireAgent.match(action)) {
      store.dispatch(
        addEvent({
          message: 'Agent hired',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (sackAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      store.dispatch(
        addEvent({
          message: `Sacked ${agentCount} agent${agentCount > 1 ? 's' : ''}`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (assignAgentsToContracting.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      store.dispatch(
        addEvent({
          message: `Assigned ${agentCount} agent${agentCount > 1 ? 's' : ''} to contracting`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (reset.match(action)) {
      store.dispatch(
        addEvent({
          message: 'Game reset',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    } else if (hasType(action) && ActionCreators.undo().type === action.type) {
      store.dispatch(
        addEvent({
          message: 'Action undone',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    } else if (hasType(action) && ActionCreators.redo().type === action.type) {
      store.dispatch(
        addEvent({
          message: 'Action redone',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    } else if (hasType(action) && ActionCreators.jumpToPast(0).type === action.type) {
      store.dispatch(
        addEvent({
          message: 'Turn reset',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    }

    return result
  }
}
