import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test } from 'vitest'
import { store } from '../../src/app/store'
import { PlayerActions } from '../../src/components/PlayerActions'

describe(PlayerActions, () => {
  test("When 'hire agent' button is pressed, agents counter is incremented from 0 to 1", async () => {
    expect.hasAssertions()

    render(
      <Provider store={store}>
        <PlayerActions />
      </Provider>,
    )

    // Check initial number of agents in store
    const initialAgents = store.getState().undoable.present.gameState.agents

    expect(initialAgents).toHaveLength(0)

    // Click the button
    await userEvent.click(screen.getByRole('button', { name: /hire agent/iu }))

    // Check updated number of agents in store
    const updatedAgents = store.getState().undoable.present.gameState.agents

    expect(updatedAgents).toHaveLength(1)
  })
})
