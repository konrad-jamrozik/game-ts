import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test } from 'vitest'
import { store } from '../../src/app/store'
import { PlayerActions } from '../../src/components/PlayerActions'

describe(PlayerActions, () => {
  test("click 'hire agent' button -> happy path", async () => {
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

  // Additional hireAgent tests
  test.todo("click 'hire agent' button -> alert: insufficient money")

  // sackAgents tests
  test.todo("click 'sack agents' button -> happy path")

  test.todo("click 'sack agents' button -> alert: agents in invalid states")

  // assignAgentsToContracting tests
  test.todo("click 'assign agents to contracting' button -> happy path")

  test.todo("click 'assign agents to contracting' button -> alert: agents in invalid states")

  // assignAgentsToEspionage tests
  test.todo("click 'assign agents to espionage' button -> happy path")

  test.todo("click 'assign agents to espionage' button -> alert: agents in invalid states")

  // recallAgents tests
  test.todo("click 'recall agents' button -> happy path")

  test.todo("click 'recall agents' button -> alert: agents in invalid states")

  // investigateLead tests
  test.todo("click 'investigate lead' button -> happy path")

  test.todo("click 'investigate lead' button -> alert: insufficient intel")

  // deployAgentsToMission tests
  test.todo("click 'deploy agents to active mission site' button -> happy path")

  test.todo("click 'deploy agents to active mission site' button -> alert: agents in invalid states")
})
