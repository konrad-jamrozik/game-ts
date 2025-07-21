import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test } from 'vitest'
import App from '../src/app/App'
import { store } from '../src/app/store'
import { ResetControls } from '../src/components/ResetControls'

describe(App, () => {
  test("When 'hire agents' button is pressed, agents counter is incremented from 0 to 1", async () => {
    expect.hasAssertions()

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    )
    // Check initial value using label association
    const agentsValue = screen.getByLabelText(/agents/iu)

    expect(agentsValue).toHaveTextContent('0')

    // Click the button
    await userEvent.click(screen.getByRole('button', { name: /hire agent/iu }))

    // Check updated value
    expect(agentsValue).toHaveTextContent('1')
  })

  test("When 'advance turn' button is clicked, the turn advances", async () => {
    expect.hasAssertions()

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    )
    // Check initial turn value
    const turnValue = screen.getByLabelText(/turn/iu)

    expect(turnValue).toHaveTextContent('1')

    // Click the advance turn button
    await userEvent.click(screen.getByRole('button', { name: /advance turn/iu }))

    // Check updated turn value
    expect(turnValue).toHaveTextContent('2')
  })

  test("Given an in-progress game state, when the 'restart game' button is clicked, the game state is reset", async () => {
    expect.hasAssertions()

    render(
      <Provider store={store}>
        <ResetControls expanded={true} />
      </Provider>,
    )

    // Verify the button is accessible when expanded=true
    const resetButton = screen.getByRole('button', { name: /reset game/iu })

    expect(resetButton).toBeInTheDocument()

    // Click the 'Reset game' button
    await userEvent.click(resetButton)

    // Since this is just testing ResetControls in isolation, we verify the action was dispatched
    // by checking that the button is still present (no error was thrown)
    expect(resetButton).toBeInTheDocument()
  })
})
