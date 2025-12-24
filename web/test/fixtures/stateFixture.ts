import { expect } from 'vitest'
import { store } from '../../src/redux/store'
import type { Agent, AgentAssignment, AgentId, AgentState } from '../../src/lib/model/agentModel'
import { isActivityAssignment } from '../../src/lib/model_utils/agentModelUtils'
import type { LeadId } from '../../src/lib/model/leadModel'
import type { Enemy } from '../../src/lib/model/enemyModel'
import type { Mission, MissionId, MissionDataId } from '../../src/lib/model/missionModel'
import type { GameState } from '../../src/lib/model/gameStateModel'
import { bldInitialState } from '../../src/lib/factories/gameStateFactory'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { setAgentSelection, setLeadSelection, setMissionSelection } from '../../src/redux/slices/selectionSlice'
import { assertDefined } from '../../src/lib/primitives/assertPrimitives'
import { bldEnemies } from '../../src/lib/factories/enemyFactory'
import { agFix } from './agentFixture'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { terminated, onContractingAssignment, available } from '../../src/lib/model_utils/agentUtils'

export const st = {
  get gameState(): GameState {
    return store.getState().undoable.present.gameState
  },

  bldAgentInStandby: (id: AgentId): Agent => st.bldAgent(id, 'Standby'),

  bldAgentInContracting: (id: AgentId): Agent => st.bldAgent(id, 'Contracting'),

  bldAgent(id: AgentId, assignment: AgentAssignment = 'Standby'): Agent {
    const state: AgentState =
      assignment === 'Training' ? 'InTraining' : isActivityAssignment(assignment) ? 'OnAssignment' : 'Available'
    return agFix.bld({ id, state, assignment })
  },

  bldAgents(options: { count?: number; skill?: number } = {}): Agent[] {
    const { count = 3, skill } = options
    const agents: Agent[] = []
    for (let index = 0; index < count; index += 1) {
      const agent = agFix.bld(skill !== undefined ? { skill: toF6(skill) } : {})
      agents.push(agent)
    }
    return agents
  },

  bldEnemyInitiate(): Enemy {
    const [enemy] = bldEnemies({ initiate: 1 })
    assertDefined(enemy)
    return enemy
  },

  bldMission(missionId: MissionId): Mission {
    const missionDataId = 'missiondata-apprehend-red-dawn-member' as MissionDataId
    return {
      id: missionId,
      missionDataId,
      agentIds: [],
      state: 'Active',
      expiresIn: 3,
      enemies: [],
    }
  },

  arrangeGameState(updates: Partial<GameState>): void {
    const customState = { ...bldInitialState(), ...updates }
    store.dispatch(reset({ customState }))
  },

  arrangeSelection(options: { agents?: AgentId[]; lead?: LeadId; mission?: MissionId }): void {
    if (options.agents) {
      store.dispatch(setAgentSelection(options.agents))
    }
    if (options.lead !== undefined) {
      store.dispatch(setLeadSelection(options.lead))
    }
    if (options.mission !== undefined) {
      store.dispatch(setMissionSelection(options.mission))
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

  expectAgentsOnMission(missionId: MissionId, agentIds: string[]): void {
    const mission = st.gameState.missions.find((m) => m.id === missionId)
    expect(mission).toBeDefined()
    if (mission) {
      expect(mission.agentIds).toStrictEqual(expect.arrayContaining(agentIds))
      expect(mission.agentIds).toHaveLength(agentIds.length)
    }
  },

  expectAgentsDeployed(agentIds: string[], missionId: MissionId): void {
    // Check each agent has OnMission state and correct assignment
    agentIds.forEach((agentId) => {
      st.expectAgentState(agentId, 'OnMission')
      st.expectAgentAssignment(agentId, missionId)
    })
    // Check mission has all the agents
    st.expectAgentsOnMission(missionId, agentIds)
  },
}
