import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '../../src/app/store'
import { PlayerActions } from '../../src/components/PlayerActions'
import { agsV, type AgentsView } from '../../src/lib/model/agents/AgentsView'

export const fix = {
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
}
