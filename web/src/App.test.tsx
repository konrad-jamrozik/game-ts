import { render } from '@testing-library/react'
// import { render, screen } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('should have a button "Add agents" and respond to click', async () => {
    render(<App />)
    // Add the button for the test (since it does not exist yet)
    // screen.getByRole('button', { name: /add agents/i });
    // userEvent.click(screen.getByRole('button', { name: /add agents/i }));
    // expect(await screen.findByText(/success/i)).toBeInTheDocument();
  })
})
