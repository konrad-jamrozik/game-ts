import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test } from 'vitest'
import { getStore } from '../../src/redux/store'
import { GameControls } from '../../src/components/GameControls/GameControls'
import { setResetControlsExpanded } from '../../src/redux/slices/settingsSlice'

describe(GameControls, () => {
  // This is commented out because I want to for the tests to reuse state.
  // This way I caught a bug after where the first test advanced turn, the second test
  // failed as 'game over' was displayed instead of 'restart game' button. This was because
  // game over logic was wrong, the panic number was still assuming bps (fixed2) precision instead of fixed6.
  // beforeEach(() => {
  //   // Reset the store before each test to ensure test isolation
  //   store.dispatch(ActionCreators.clearHistory())
  //   store.dispatch(reset())
  // })

  test("click 'next turn' button -> happy path", async () => {
    expect.hasAssertions()
    const store = getStore()

    render(
      <Provider store={store}>
        <GameControls />
      </Provider>,
    )
    // Check initial turn value
    const turnValue = screen.getByLabelText(/Turn:/iu)

    expect(turnValue).toHaveTextContent('1')

    // Click the next turn button
    await userEvent.click(screen.getByRole('button', { name: /next turn/iu }))

    // Check updated turn value
    expect(turnValue).toHaveTextContent('2')
  })

  test("click 'restart game' button -> happy path", async () => {
    expect.hasAssertions()
    const store = getStore()

    // Set the reset controls to be expanded in the store
    store.dispatch(setResetControlsExpanded(true))

    render(
      <Provider store={store}>
        <GameControls />
      </Provider>,
    )

    // First, click "next turn" to ensure the game state is "in progress"
    await userEvent.click(screen.getByRole('button', { name: /next turn/iu }))

    // Verify the button is accessible when expanded=true
    const resetButton = screen.getByRole('button', { name: /reset game/iu })

    expect(resetButton).toBeInTheDocument()

    // Click the 'Reset game' button
    await userEvent.click(resetButton)

    // Verify the game state was reset by checking the turn is back to 1
    const turnValue = screen.getByLabelText(/turn/iu)

    expect(turnValue).toHaveTextContent('1')
  })
})
