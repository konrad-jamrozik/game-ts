import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { expect } from 'vitest'
import { produce } from 'immer'
import { store } from '../../src/app/store'
import { PlayerActions } from '../../src/components/PlayerActions'
import { agsV, type AgentsView } from '../../src/lib/model/agents/AgentsView'
import type {
  Agent,
  AgentAssignment,
  AgentState,
  GameState,
  MissionSite,
  MissionSiteId,
} from '../../src/lib/model/model'
import { makeInitialState } from '../../src/lib/model/ruleset/initialState'
import { clearEvents } from '../../src/lib/slices/eventsSlice'
import { reset } from '../../src/lib/slices/gameStateSlice'
import { setAgentSelection, setLeadSelection, setMissionSiteSelection } from '../../src/lib/slices/selectionSlice'
import { AgentFixture } from '../fixtures/AgentFixture'
import { MissionSiteFixture } from '../fixtures/MissionSiteFixture'

export const fix = {
  setDebugInitialState(): void {
    store.dispatch(reset({ debug: true }))
    store.dispatch(clearEvents()) // Clear the reset event
  },

  setInitialState(customState: GameState): void {
    store.dispatch(reset({ customState }))
  },

  setMoneyAndFunding(amount: number): void {
    const state = makeInitialState()
    state.money = amount
    state.funding = amount
    fix.setInitialState(state)
  },

  renderPlayerActions(): void {
    render(
      <Provider store={store}>
        <PlayerActions />
      </Provider>,
    )
  },
  async hireAgent(): Promise<void> {
    // Click the button
    await userEvent.click(screen.getByRole('button', { name: /hire agent/iu }))
  },

  get gameState(): GameState {
    return store.getState().undoable.present.gameState
  },

  get agentsView(): AgentsView {
    return agsV(fix.gameState.agents)
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

  // Agent creation and manipulation helpers
  newAgent(id: string): Agent {
    return fix.newAgent2(id, 'Standby')
  },

  newAgent2(id: string, assignment: AgentAssignment = 'Standby'): Agent {
    const state: AgentState = assignment === 'Contracting' || assignment === 'Espionage' ? 'OnAssignment' : 'Available'

    return AgentFixture.new({ id, state, assignment })
  },

  newOnAssignmentAgent(id: string, assignment: AgentAssignment = 'Contracting'): Agent {
    return fix.newAgent2(id, assignment)
  },

  createOnEspionageAgent(id = 'agent-3'): Agent {
    return AgentFixture.new({ id, state: 'OnAssignment', assignment: 'Espionage' })
  },

  createOnMissionAgent(id = 'agent-4', missionSiteId: MissionSiteId = 'mission-site-1' as MissionSiteId): Agent {
    return AgentFixture.new({ id, state: 'OnMission', assignment: missionSiteId })
  },

  setAgentsInState(agents: Agent[]): void {
    const state = makeInitialState()
    state.agents = agents
    fix.setInitialState(state)
  },

  setIntel(amount: number): void {
    const state = makeInitialState()
    state.intel = amount
    fix.setInitialState(state)
  },

  setMissionSiteAndIntel(missionSiteId: MissionSiteId, intel = 100): void {
    const state = makeInitialState()
    state.intel = intel
    const missionSite: MissionSite = {
      id: missionSiteId,
      missionId: 'mission-apprehend-red-dawn',
      agentIds: [],
      state: 'Active',
      expiresIn: 3,
      enemies: [],
    }
    state.missionSites = [missionSite]
    fix.setInitialState(state)
  },

  // Selection helpers
  selectAgents(agentIds: string[]): void {
    store.dispatch(setAgentSelection(agentIds))
  },

  selectLead(leadId: string): void {
    store.dispatch(setLeadSelection(leadId))
  },

  selectMissionSite(missionSiteId: MissionSiteId): void {
    store.dispatch(setMissionSiteSelection(missionSiteId))
  },

  // Button click helpers
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
    // First try to find the button - it might be disabled if selection state isn't proper
    const deployButton = screen.getByRole('button', { name: /deploy.*on/iu })
    await userEvent.click(deployButton)
  },

  // State check helpers
  expectAgentCount(expectedCount: number): void {
    expect(fix.agentsView).toHaveLength(expectedCount)
  },

  expectAgentState(agentId: string, expectedState: Agent['state']): void {
    const agent = fix.gameState.agents.find((ag) => ag.id === agentId)
    expect(agent).toBeDefined()
    if (agent) {
      expect(agent.state).toBe(expectedState)
    }
  },

  expectAgentAssignment(agentId: string, expectedAssignment: Agent['assignment']): void {
    const agent = fix.gameState.agents.find((ag) => ag.id === agentId)
    expect(agent).toBeDefined()
    if (agent) {
      expect(agent.assignment).toBe(expectedAssignment)
    }
  },

  expectAgentsOnContracting(count: number): void {
    const contractingAgents = fix.agentsView.onContractingAssignment()
    expect(contractingAgents).toHaveLength(count)
  },

  expectAgentsOnEspionage(count: number): void {
    const espionageAgents = fix.agentsView.onEspionageAssignment()
    expect(espionageAgents).toHaveLength(count)
  },

  expectAgentsAvailable(count: number): void {
    const availableAgents = fix.agentsView.available()
    expect(availableAgents).toHaveLength(count)
  },

  expectIntelAmount(expectedAmount: number): void {
    expect(fix.gameState.intel).toBe(expectedAmount)
  },

  expectLeadInvestigated(leadId: string, times = 1): void {
    expect(fix.gameState.leadInvestigationCounts[leadId] ?? 0).toBe(times)
  },

  expectAgentsOnMissionSite(missionSiteId: MissionSiteId, agentIds: string[]): void {
    const missionSite = fix.gameState.missionSites.find((ms) => ms.id === missionSiteId)
    expect(missionSite).toBeDefined()
    if (missionSite) {
      expect(missionSite.agentIds).toStrictEqual(expect.arrayContaining(agentIds))
      expect(missionSite.agentIds).toHaveLength(agentIds.length)
    }
  },

  expectAgentsDeployed(agentIds: string[], missionSiteId: MissionSiteId): void {
    // Check each agent has OnMission state and correct assignment
    agentIds.forEach((agentId) => {
      fix.expectAgentState(agentId, 'OnMission')
      fix.expectAgentAssignment(agentId, missionSiteId)
    })
    // Check mission site has all the agents
    fix.expectAgentsOnMissionSite(missionSiteId, agentIds)
  },

  newMissionSite(missionSiteId: MissionSiteId): MissionSite {
    return MissionSiteFixture.new({
      id: missionSiteId,
      missionId: 'mission-apprehend-red-dawn',
      agentIds: [],
      state: 'Active',
      expiresIn: 3,
      enemies: [],
    })
  },

  buildAndSetInitialState(updates: Partial<GameState>): void {
    const initialState = produce(makeInitialState(), (draft) => {
      Object.assign(draft, updates)
    })
    fix.setInitialState(initialState)
  },
}
