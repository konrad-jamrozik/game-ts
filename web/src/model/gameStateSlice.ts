import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type AgentState = 'Available' | 'Training' | 'InTransit' | 'Recovering' | 'Contracting'

export type Agent = {
  id: string
  turnHired: number
  state: AgentState
  assignment: string
}

export type GameState = {
  actionsCount: number
  turn: number
  agents: Agent[]
  money: number
  nextAgentId: number
}

const initialState: GameState = {
  actionsCount: 0,
  turn: 1,
  agents: [],
  money: 100,
  nextAgentId: 0,
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
        // Change all InTransit agents to Available
        for (const agent of state.agents) {
          if (agent.state === 'InTransit') {
            agent.state = 'Available'
          }
        }
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
        }
        state.agents.push(newAgent)
        state.nextAgentId += 1
        state.actionsCount += 1
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
    setMoney(state, action: PayloadAction<number>) {
      state.money = action.payload
    },
    reset(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { advanceTurn, hireAgent, sackAgents, setMoney, reset } = gameStateSlice.actions
export default gameStateSlice.reducer
