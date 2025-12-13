import { expect } from 'vitest'
import { store } from '../../src/redux/store'
import { isActivityAssignment, type Agent, type AgentAssignment, type AgentState } from '../../src/lib/model/agentModel'
import type { Enemy, MissionSite, MissionSiteId } from '../../src/lib/model/model'
import type { GameState } from '../../src/lib/model/gameStateModel'
import { makeInitialState } from '../../src/lib/ruleset/initialState'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { setAgentSelection, setLeadSelection, setMissionSiteSelection } from '../../src/redux/slices/selectionSlice'
import { assertDefined } from '../../src/lib/primitives/assertPrimitives'
import { newEnemiesFromSpec } from '../../src/lib/ruleset/enemyRuleset'
import { agFix } from './agentFixture'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { terminated, onContractingAssignment, available } from '../../src/lib/model_utils/agentUtils'

export const st = {
  get gameState(): GameState {
    return store.getState().undoable.present.gameState
  },

  newAgentInStandby: (id: string): Agent => st.newAgent(id, 'Standby'),

  newAgentInContracting: (id: string): Agent => st.newAgent(id, 'Contracting'),

  newAgent(id: string, assignment: AgentAssignment = 'Standby'): Agent {
    const state: AgentState =
      assignment === 'Training' ? 'InTraining' : isActivityAssignment(assignment) ? 'OnAssignment' : 'Available'
    return agFix.new({ id, state, assignment })
  },

  newAgents(options: { count?: number; skill?: number } = {}): Agent[] {
    const { count = 3, skill } = options
    const agents: Agent[] = []
    for (let index = 0; index < count; index += 1) {
      const agent = agFix.new(skill !== undefined ? { skill: toF6(skill) } : {})
      agents.push(agent)
    }
    return agents
  },

  newEnemyInitiate(): Enemy {
    const [enemy] = newEnemiesFromSpec('1 Initiate')
    assertDefined(enemy)
    return enemy
  },

  newMissionSite(missionSiteId: MissionSiteId): MissionSite {
    return {
      id: missionSiteId,
      missionId: 'mission-apprehend-red-dawn-member',
      agentIds: [],
      state: 'Active',
      expiresIn: 3,
      enemies: [],
      operationLevel: 0,
    }
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

  expectLeadInvestigatedOnce(leadId: string): void {
    st.expectLeadInvestigated(leadId, 1)
  },

  expectLeadNotInvestigated(leadId: string): void {
    st.expectLeadInvestigated(leadId, 0)
  },

  expectLeadInvestigated(leadId: string, times = 1): void {
    expect(st.gameState.leadInvestigationCounts[leadId] ?? 0).toBe(times)
  },

  expectLeadInvestigationCreated(leadId: string): void {
    const investigations = Object.values(st.gameState.leadInvestigations).filter((inv) => inv.leadId === leadId)
    expect(investigations.length).toBeGreaterThan(0)
  },

  expectAgentCount(expectedCount: number): void {
    expect(st.gameState.agents).toHaveLength(expectedCount)
  },

  expectTerminatedAgentCount(expectedCount: number): void {
    expect(terminated(st.gameState.agents)).toHaveLength(expectedCount)
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
    const contractingAgents = onContractingAssignment(st.gameState.agents)
    expect(contractingAgents).toHaveLength(count)
  },

  expectAgentsAvailable(count: number): void {
    const availableAgents = available(st.gameState.agents)
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
