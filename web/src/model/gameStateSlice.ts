import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  AGENT_HIRE_COST,
  AGENT_INITIAL_SKILL,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_EXHAUSTION_INCREASE_PER_TURN,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
} from '../ruleset/constants'
import initialAssets from '../ruleset/initialAssets'
import type { GameState, Agent, MissionSite } from './model'
import { getMoneyNewBalance, getIntelNewBalance } from './modelDerived'

const initialState: GameState = {
  turn: 1,
  actionsCount: 0,
  nextAgentId: 0,
  nextMissionSiteId: 0,
  hireCost: 50,
  ...initialAssets,
}

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    advanceTurn: {
      // 🚧KJA Dedup this "prepare" be using something like "withPlayerAction" https://chatgpt.com/c/687c730e-12d4-8011-96fc-be2be1ef5e94
      // Also style guide says many reducers should work with same player action: https://redux.js.org/style-guide/#allow-many-reducers-to-respond-to-the-same-action
      // See https://redux-toolkit.js.org/usage/usage-with-typescript#wrapping-createslice
      // See https://redux.js.org/understanding/history-and-design/middleware
      reducer(state) {
        state.turn += 1
        state.actionsCount = 0
        // Handle InTransit agents based on their assignment and update exhaustion
        for (const agent of state.agents) {
          // Update exhaustion based on agent state and assignment
          if (
            agent.state === 'OnAssignment' &&
            (agent.assignment === 'Contracting' || agent.assignment === 'Espionage')
          ) {
            agent.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_TURN
          } else if (agent.state === 'OnMission') {
            agent.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_TURN
          } else if (agent.state === 'Available' && agent.assignment === 'Standby') {
            agent.exhaustion = Math.max(0, agent.exhaustion - AGENT_EXHAUSTION_RECOVERY_PER_TURN)
          }
          if (agent.state === 'InTransit') {
            agent.state =
              agent.assignment === 'Contracting' || agent.assignment === 'Espionage' ? 'OnAssignment' : 'Available'
          } else if (agent.state === 'OnMission') {
            // Agents on mission return to standby after one turn
            agent.state = 'InTransit'
            agent.assignment = 'Standby'
          }
        }

        // Update mission site states
        for (const missionSite of state.missionSites) {
          if (missionSite.state === 'Active') {
            // Check if mission site should be marked as successful or failed
            missionSite.state = missionSite.agentIds.length >= 2 ? 'Successful' : 'Failed'
          }
        }
        state.money = getMoneyNewBalance(state)
        state.intel = getIntelNewBalance(state)
        state.hireCost = 0
      },
      prepare() {
        return { payload: undefined, meta: { playerAction: true } }
      },
    },
    hireAgent: {
      reducer(state) {
        const newAgent: Agent = {
          id: `agent-${state.nextAgentId.toString().padStart(3, '0')}`,
          turnHired: state.turn,
          state: 'InTransit',
          assignment: 'Standby',
          skill: AGENT_INITIAL_SKILL,
          exhaustion: AGENT_INITIAL_EXHAUSTION,
        }
        state.agents.push(newAgent)
        state.nextAgentId += 1
        state.actionsCount += 1
        state.hireCost += AGENT_HIRE_COST
      },
      prepare() {
        return { payload: undefined, meta: { playerAction: true } }
      },
    },
    sackAgents: {
      reducer(state, action: PayloadAction<string[]>) {
        const agentIdsToSack = action.payload
        state.agents = state.agents.filter((agent) => !agentIdsToSack.includes(agent.id))
        state.actionsCount += 1
      },
      prepare(agentIds: string[]) {
        return { payload: agentIds, meta: { playerAction: true } }
      },
    },
    assignAgentsToContracting: {
      reducer(state, action: PayloadAction<string[]>) {
        const agentIdsToAssign = action.payload
        for (const agent of state.agents) {
          if (agentIdsToAssign.includes(agent.id)) {
            agent.assignment = 'Contracting'
            agent.state = 'InTransit'
          }
        }
        state.actionsCount += 1
      },
      prepare(agentIds: string[]) {
        return { payload: agentIds, meta: { playerAction: true } }
      },
    },
    assignAgentsToEspionage: {
      reducer(state, action: PayloadAction<string[]>) {
        const agentIdsToAssign = action.payload
        for (const agent of state.agents) {
          if (agentIdsToAssign.includes(agent.id)) {
            agent.assignment = 'Espionage'
            agent.state = 'InTransit'
          }
        }
        state.actionsCount += 1
      },
      prepare(agentIds: string[]) {
        return { payload: agentIds, meta: { playerAction: true } }
      },
    },
    recallAgents: {
      reducer(state, action: PayloadAction<string[]>) {
        const agentIdsToRecall = action.payload
        for (const agent of state.agents) {
          if (agentIdsToRecall.includes(agent.id)) {
            agent.assignment = 'Standby'
            agent.state = 'InTransit'
          }
        }
        state.actionsCount += 1
      },
      prepare(agentIds: string[]) {
        return { payload: agentIds, meta: { playerAction: true } }
      },
    },
    setMoney(state, action: PayloadAction<number>) {
      state.money = action.payload
    },
    setFunding(state, action: PayloadAction<number>) {
      state.funding = action.payload
    },
    reset(state) {
      Object.assign(state, initialState)
    },
    investigateLead: {
      reducer(state, action: PayloadAction<{ leadId: string; intelCost: number }>) {
        const { leadId, intelCost } = action.payload

        // Add to investigatedLeadIds if not already there (for all leads)
        if (!state.investigatedLeadIds.includes(leadId)) {
          state.investigatedLeadIds.push(leadId)
        }

        // Track investigation count for all leads
        const currentCount = state.leadInvestigationCounts[leadId] ?? 0
        state.leadInvestigationCounts[leadId] = currentCount + 1

        state.intel -= intelCost
        state.actionsCount += 1
      },
      prepare(leadId: string, intelCost: number) {
        return { payload: { leadId, intelCost }, meta: { playerAction: true } }
      },
    },
    deployAgentsToMission: {
      reducer(state, action: PayloadAction<{ missionId: string; agentIds: string[] }>) {
        const { missionId, agentIds } = action.payload

        // Create a new mission site
        const missionSiteId = `mission-site-${state.nextMissionSiteId.toString().padStart(3, '0')}`
        const newMissionSite: MissionSite = {
          id: missionSiteId,
          missionId,
          agentIds: [...agentIds],
          state: 'Active',
        }

        state.missionSites.push(newMissionSite)
        state.nextMissionSiteId += 1

        // Assign agents to the mission site
        for (const agent of state.agents) {
          if (agentIds.includes(agent.id)) {
            agent.assignment = missionSiteId
            agent.state = 'OnMission'
          }
        }

        state.actionsCount += 1
      },
      prepare(missionId: string, agentIds: string[]) {
        return { payload: { missionId, agentIds }, meta: { playerAction: true } }
      },
    },
  },
})

export const {
  advanceTurn,
  hireAgent,
  sackAgents,
  assignAgentsToContracting,
  assignAgentsToEspionage,
  recallAgents,
  setMoney,
  setFunding,
  reset,
  investigateLead,
  deployAgentsToMission,
} = gameStateSlice.actions
export default gameStateSlice.reducer
