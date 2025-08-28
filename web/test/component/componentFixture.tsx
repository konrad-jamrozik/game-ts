import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { expect } from 'vitest'
import { store } from '../../src/app/store'
import { PlayerActions } from '../../src/components/PlayerActions'
import { agsV, type AgentsView } from '../../src/lib/model/agents/AgentsView'
import type { GameState } from '../../src/lib/model/model'
import { makeInitialState } from '../../src/lib/model/ruleset/initialState'
import { clearEvents } from '../../src/lib/slices/eventsSlice'
import { reset } from '../../src/lib/slices/gameStateSlice'

export const fix = {
  setDebugInitialState(): void {
    store.dispatch(reset({ debug: true }))
    store.dispatch(clearEvents()) // Clear the reset event
  },

  setInitialState(customState: GameState): void {
    store.dispatch(reset({ customState }))
  },

  setMoney(amount: number): void {
    const state = makeInitialState()
    state.money = amount
    fix.setInitialState(state)
  },

  renderPlayerActions(): void {
    render(
      <Provider store={store}>
        <PlayerActions />
      </Provider>,
    )
  },
  async hireAgent(): Promise<void> {
    // Click the button
    await userEvent.click(screen.getByRole('button', { name: /hire agent/iu }))
  },

  get agentsView(): AgentsView {
    return agsV(store.getState().undoable.present.gameState.agents)
  },

  expectPlayerActionsAlert(message: string | { hidden: true }): void {
    const alert = screen.queryByRole('alert', { name: 'player-actions-alert' })
    if (typeof message === 'object' && 'hidden' in message) {
      expect(alert).not.toBeInTheDocument()
    } else {
      expect(alert).toBeInTheDocument()
      expect(alert).toBeVisible()
      expect(alert).toHaveTextContent(message)
    }
  },
}
