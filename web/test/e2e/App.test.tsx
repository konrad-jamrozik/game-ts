import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import App from '../../src/components/App'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { bldInitialState } from '../../src/lib/factories/gameStateFactory'
import { getGameControlsNextTurnButton } from '../utils/testComponentUtils'

describe(App, () => {
  beforeEach(() => {
    const store = getStore()
    // Reset store to clean state and clear undo history
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
  })

  /**
   * Full-App boot/smoke test.
   *
   * Renders the entire App with the debug fixture and verifies it boots without
   * crashing and that advancing a turn works end to end (real store + events and
   * persistence middleware). Per-action behavior (hire, investigate, deploy,
   * reset) and the lose/game-over flow are covered by the component and unit
   * tests; this test only guards the overall wiring.
   */
  test('App boots with debug state and advances a turn', async () => {
    expect.hasAssertions()

    const store = getStore()
    store.dispatch(reset({ customState: bldInitialState({ debug: true }) }))

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    )

    // The app boots in turn 1 (the Turn label stays visible on every screen).
    expect(screen.getByLabelText('Turn:')).toHaveTextContent('1')

    // The debug fixture renders on the Leads and Agents screens, reached via the
    // Game Controls navigation buttons.
    await userEvent.click(screen.getByRole('button', { name: 'Leads' }))
    expect(screen.getAllByText(/Criminal organizations/iu).length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('button', { name: 'Agents' }))
    expect(screen.getByText(/agent-000/iu)).toBeInTheDocument()

    // Advancing a turn flows through the real store and middleware.
    await userEvent.click(getGameControlsNextTurnButton())

    expect(screen.getByLabelText('Turn:')).toHaveTextContent('2')
  })
})
