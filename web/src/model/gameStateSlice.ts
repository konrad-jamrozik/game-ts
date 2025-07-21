import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Agent = {
  id: string
  turnHired: number
}

export type GameState = {
  actionsCount: number
  turn: number
  agents: Agent[]
  money: number
}

const initialState: GameState = {
  actionsCount: 0,
  turn: 1,
  agents: [],
  money: 100,
}

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    advanceTurn: {
      // 🚧KJA Dedup this prepare be using something like "withPlayerAction" https://chatgpt.com/c/687c730e-12d4-8011-96fc-be2be1ef5e94
      // Also style guide says many reducers should work with same player action: https://redux.js.org/style-guide/#allow-many-reducers-to-respond-to-the-same-action
      // See https://redux-toolkit.js.org/usage/usage-with-typescript#wrapping-createslice
      reducer(state) {
        state.turn += 1
        state.actionsCount = 0
      },
      prepare() {
        return { payload: undefined, meta: { playerAction: true } }
      },
    },
    hireAgent: {
      reducer(state) {
        const newAgent: Agent = {
          id: `agent-${state.agents.length.toString().padStart(3, '0')}`,
          turnHired: state.turn,
        }
        state.agents.push(newAgent)
        state.actionsCount += 1
      },
      prepare() {
        return { payload: undefined, meta: { playerAction: true } }
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

export const { advanceTurn, hireAgent, setMoney, reset } = gameStateSlice.actions
export default gameStateSlice.reducer
