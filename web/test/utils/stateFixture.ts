import { expect } from 'vitest'
import { store } from '../../src/app/store'
import { agsV, type AgentsView } from '../../src/lib/model/agents/AgentsView'
import {
  isActivityAssignment,
  type Agent,
  type AgentAssignment,
  type AgentState,
  type GameState,
  type MissionSite,
  type MissionSiteId,
} from '../../src/lib/model/model'
import { makeInitialState } from '../../src/lib/model/ruleset/initialState'
import { reset } from '../../src/lib/slices/gameStateSlice'
import { setAgentSelection, setLeadSelection, setMissionSiteSelection } from '../../src/lib/slices/selectionSlice'
import { AgentFixture } from '../fixtures/AgentFixture'
import { MissionSiteFixture } from '../fixtures/MissionSiteFixture'

export const st = {
  get gameState(): GameState {
    return store.getState().undoable.present.gameState
  },

  get agentsView(): AgentsView {
    return agsV(st.gameState.agents)
  },

  newAgentInStandby: (id: string): Agent => st.newAgent(id, 'Standby'),

  newAgentInContracting: (id: string): Agent => st.newAgent(id, 'Contracting'),

  newAgentInEspionage: (id: string): Agent => st.newAgent(id, 'Espionage'),

  newAgent(id: string, assignment: AgentAssignment = 'Standby'): Agent {
    const state: AgentState = isActivityAssignment(assignment) ? 'OnAssignment' : 'Available'
    return AgentFixture.new({ id, state, assignment })
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

  arrangeGameState(updates: Partial<GameState>): void {
    const customState = { ...makeInitialState(), ...updates }
    store.dispatch(reset({ customState }))
  },

  arrangeSelection(options: { agents?: string[]; lead?: string; missionSite?: MissionSiteId }): void {
    if (options.agents) {
      store.dispatch(setAgentSelection(options.agents))
    }
    if (options.lead !== undefined) {
      store.dispatch(setLeadSelection(options.lead))
    }
    if (options.missionSite !== undefined) {
      store.dispatch(setMissionSiteSelection(options.missionSite))
    }
  },

  expectIntelAmount(expectedAmount: number): void {
    expect(st.gameState.intel).toBe(expectedAmount)
  },

  expectLeadInvestigatedOnce(leadId: string): void {
    st.expectLeadInvestigated(leadId, 1)
  },

  expectLeadNotInvestigated(leadId: string): void {
    st.expectLeadInvestigated(leadId, 0)
  },

  expectLeadInvestigated(leadId: string, times = 1): void {
    expect(st.gameState.leadInvestigationCounts[leadId] ?? 0).toBe(times)
  },

  expectAgentCount(expectedCount: number): void {
    expect(st.agentsView).toHaveLength(expectedCount)
  },

  expectTerminatedAgentCount(expectedCount: number): void {
    expect(st.agentsView.terminated()).toHaveLength(expectedCount)
  },

  expectAgentState(agentId: string, expectedState: Agent['state']): void {
    const agent = st.gameState.agents.find((ag) => ag.id === agentId)
    expect(agent).toBeDefined()
    if (agent) {
      expect(agent.state).toBe(expectedState)
    }
  },

  expectAgentAssignment(agentId: string, expectedAssignment: Agent['assignment']): void {
    const agent = st.gameState.agents.find((ag) => ag.id === agentId)
    expect(agent).toBeDefined()
    if (agent) {
      expect(agent.assignment).toBe(expectedAssignment)
    }
  },

  expectAgentsOnContracting(count: number): void {
    const contractingAgents = st.agentsView.onContractingAssignment()
    expect(contractingAgents).toHaveLength(count)
  },

  expectAgentsOnEspionage(count: number): void {
    const espionageAgents = st.agentsView.onEspionageAssignment()
    expect(espionageAgents).toHaveLength(count)
  },

  expectAgentsAvailable(count: number): void {
    const availableAgents = st.agentsView.available()
    expect(availableAgents).toHaveLength(count)
  },

  expectAgentsOnAssignment(agentIds: string[], assignment: AgentAssignment): void {
    agentIds.forEach((agentId) => {
      st.expectAgentAssignment(agentId, assignment)
      if (isActivityAssignment(assignment)) {
        st.expectAgentState(agentId, 'OnAssignment')
      }
    })
  },

  expectAgentsOnMissionSite(missionSiteId: MissionSiteId, agentIds: string[]): void {
    const missionSite = st.gameState.missionSites.find((ms) => ms.id === missionSiteId)
    expect(missionSite).toBeDefined()
    if (missionSite) {
      expect(missionSite.agentIds).toStrictEqual(expect.arrayContaining(agentIds))
      expect(missionSite.agentIds).toHaveLength(agentIds.length)
    }
  },

  expectAgentsDeployed(agentIds: string[], missionSiteId: MissionSiteId): void {
    // Check each agent has OnMission state and correct assignment
    agentIds.forEach((agentId) => {
      st.expectAgentState(agentId, 'OnMission')
      st.expectAgentAssignment(agentId, missionSiteId)
    })
    // Check mission site has all the agents
    st.expectAgentsOnMissionSite(missionSiteId, agentIds)
  },
}
