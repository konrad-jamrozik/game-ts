import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { 
  AGENT_HIRE_COST, 
  AGENT_INITIAL_SKILL, 
  AGENT_INITIAL_EXHAUSTION,
  AGENT_EXHAUSTION_INCREASE_PER_TURN,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN 
} from '../ruleset/constants'
import initialAssets from '../ruleset/initialAssets'
import type { GameState, Agent } from './model'
import { getMoneyProjected } from './modelDerived'

const initialState: GameState = {
  turn: 1,
  actionsCount: 0,
  nextAgentId: 0,
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
          if (agent.state === 'InTransit') {
            agent.state = agent.assignment === 'Contracting' ? 'OnAssignment' : 'Available'
          }
          
          // Update exhaustion based on agent state and assignment
          if (agent.state === 'OnAssignment' && agent.assignment === 'Contracting') {
            agent.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_TURN
          } else if (agent.state === 'Available' && agent.assignment === 'Standby') {
            agent.exhaustion = Math.max(0, agent.exhaustion - AGENT_EXHAUSTION_RECOVERY_PER_TURN)
          }
        }
        state.money = getMoneyProjected(state)
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
  },
})

export const {
  advanceTurn,
  hireAgent,
  sackAgents,
  assignAgentsToContracting,
  recallAgents,
  setMoney,
  setFunding,
  reset,
} = gameStateSlice.actions
export default gameStateSlice.reducer
