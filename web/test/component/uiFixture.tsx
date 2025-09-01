import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { expect } from 'vitest'
import { store } from '../../src/app/store'
import { PlayerActions } from '../../src/components/PlayerActions'

// KJA move ui to fixtures dir
export const ui = {
  renderPlayerActions(): void {
    render(
      <Provider store={store}>
        <PlayerActions />
      </Provider>,
    )
  },

  async hireAgent(): Promise<void> {
    await userEvent.click(screen.getByRole('button', { name: /hire agent/iu }))
  },

  async sackAgents(): Promise<void> {
    await userEvent.click(screen.getByRole('button', { name: /sack.*agent/iu }))
  },

  async assignToContracting(): Promise<void> {
    await userEvent.click(screen.getByRole('button', { name: /assign.*to contracting/iu }))
  },

  async assignToEspionage(): Promise<void> {
    await userEvent.click(screen.getByRole('button', { name: /assign.*to espionage/iu }))
  },

  async recallAgents(): Promise<void> {
    await userEvent.click(screen.getByRole('button', { name: /recall.*agent/iu }))
  },

  async investigateLead(): Promise<void> {
    await userEvent.click(screen.getByRole('button', { name: /investigate lead/iu }))
  },

  async deployAgents(): Promise<void> {
    const deployButton = screen.getByRole('button', { name: /deploy.*on/iu })
    await userEvent.click(deployButton)
  },

  expectPlayerActionsAlert(message: string | { hidden: true }): void {
    const alert = screen.queryByRole('alert', { name: 'player-actions-alert' })
    if (typeof message === 'object' && 'hidden' in message) {
      expect(alert).not.toBeInTheDocument()
    } else {
      expect(alert).toBeInTheDocument()
      expect(alert).toBeVisible()
      expect(alert).toHaveTextContent(message)
    }
  },
}
