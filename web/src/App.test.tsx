import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  test("When 'hire agents' button is pressed, agents counter is incremented from 0 to 1", async () => {
    render(<App />)
    // Check initial value using label association
    const agentsValue = screen.getByLabelText(/agents/iu)
    expect(agentsValue).toHaveTextContent('0')
    // Click the button
    await userEvent.click(screen.getByRole('button', { name: /hire agents/iu }))
    // Check updated value
    expect(agentsValue).toHaveTextContent('1')
  })

  test("When 'advance turn' button is clicked, the turn advances", async () => {
    render(<App />)
    // Check initial turn value
    const turnValue = screen.getByLabelText(/turn/iu)
    expect(turnValue).toHaveTextContent('0')
    // Click the advance turn button
    await userEvent.click(screen.getByRole('button', { name: /advance turn/iu }))
    // Check updated turn value
    expect(turnValue).toHaveTextContent('1')
  })

  test("Given an in-progress game state, when the 'restart game' button is clicked, the game state is reset", async () => {
    render(<App />)
    // Click the 'Reset game' button
    await userEvent.click(screen.getByRole('button', { name: /reset game/iu }))
    // Assert that now the game turn, agents count and money are reset to initial values.
    expect(screen.getByLabelText(/turn/iu)).toHaveTextContent('0')
    expect(screen.getByLabelText(/agents/iu)).toHaveTextContent('0')
    expect(screen.getByLabelText(/money/iu)).toHaveTextContent('100')
  })
})
