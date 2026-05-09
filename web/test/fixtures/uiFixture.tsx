import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { expect } from 'vitest'
import { getStore } from '../../src/redux/store'
import { AgentManagementActions } from '../../src/components/Agents/AgentManagementActions'
import { MissionDeploymentActions } from '../../src/components/Missions/MissionDeploymentActions'
import { LeadInvestigationActions } from '../../src/components/Leads/LeadInvestigationActions'

export const ui = {
  renderAgentManagementActions(): void {
    const store = getStore()
    render(
      <Provider store={store}>
        <AgentManagementActions />
      </Provider>,
    )
  },

  renderMissionDeploymentActions(): void {
    const store = getStore()
    render(
      <Provider store={store}>
        <MissionDeploymentActions />
      </Provider>,
    )
  },

  renderLeadInvestigationActions(): void {
    const store = getStore()
    render(
      <Provider store={store}>
        <LeadInvestigationActions />
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

  expectInvestigateLeadButtonDisabled(): void {
    const button = screen.getByRole('button', { name: /select ready agents/iu })
    expect(button).toBeDisabled()
  },

  expectAgentManagementAlert(message: string | { hidden: true }): void {
    const alert = screen.queryByRole('alert', { name: 'agent-management-actions-alert' })
    if (typeof message === 'object' && 'hidden' in message) {
      expect(alert).not.toBeInTheDocument()
    } else {
      expect(alert).toBeInTheDocument()
      expect(alert).toBeVisible()
      expect(alert).toHaveTextContent(message)
    }
  },

  expectMissionDeploymentAlert(message: string | { hidden: true }): void {
    const alert = screen.queryByRole('alert', { name: 'mission-deployment-actions-alert' })
    if (typeof message === 'object' && 'hidden' in message) {
      expect(alert).not.toBeInTheDocument()
    } else {
      expect(alert).toBeInTheDocument()
      expect(alert).toBeVisible()
      expect(alert).toHaveTextContent(message)
    }
  },
}
