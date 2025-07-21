import type { Middleware } from '@reduxjs/toolkit'
import { addEvent } from '../model/eventsSlice'
import { advanceTurn, hireAgent } from '../model/gameStateSlice'
import type { RootState } from './store'

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
          turn: gameState.turn - 1,
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
    }

    return result
  }
}
