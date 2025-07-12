import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('should have a button "Add agents" and respond to click', async () => {
    render(<App />)
    // Add the button for the test (since it does not exist yet)
    screen.getByRole('button', { name: /add agents/iu })
    await userEvent.click(screen.getByRole('button', { name: /add agents/iu }))
    expect(await screen.findByText(/success/iu)).toBeInTheDocument()
  })

  it('should increment "Agents counter" from 0 to 1 when "Add agents" is pressed once', async () => {
    render(<App />)
    // Check label exists
    expect(screen.getByText(/agents counter/iu)).toBeInTheDocument()
    // Check initial value
    expect(screen.getByText('0')).toBeInTheDocument()
    // Click the button
    await userEvent.click(screen.getByRole('button', { name: /add agents/iu }))
    // Check updated value
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
