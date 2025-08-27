import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test } from 'vitest'
import { store } from '../../src/app/store'
import { GameControls } from '../../src/components/GameControls'
import { setResetControlsExpanded } from '../../src/lib/slices/settingsSlice'

describe(GameControls, () => {
  test("click 'advance turn' button -> happy path", async () => {
    expect.hasAssertions()

    render(
      <Provider store={store}>
        <GameControls />
      </Provider>,
    )
    // Check initial turn value
    const turnValue = screen.getByLabelText(/Turn:/iu)

    expect(turnValue).toHaveTextContent('1')

    // Click the advance turn button
    await userEvent.click(screen.getByRole('button', { name: /advance turn/iu }))

    // Check updated turn value
    expect(turnValue).toHaveTextContent('2')
  })

  test("click 'restart game' button -> happy path", async () => {
    expect.hasAssertions()

    // Set the reset controls to be expanded in the store
    store.dispatch(setResetControlsExpanded(true))

    render(
      <Provider store={store}>
        <GameControls />
      </Provider>,
    )

    // First, click "Advance turn" to ensure the game state is "in progress"
    await userEvent.click(screen.getByRole('button', { name: /advance turn/iu }))

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
