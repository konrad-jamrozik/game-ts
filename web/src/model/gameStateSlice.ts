import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { ActionCreators } from 'redux-undo'

export type GameState = {
  actionsCount: number
  turn: number
  agents: number
  money: number
}

const initialState: GameState = {
  actionsCount: 0,
  turn: 0,
  agents: 0,
  money: 100,
}

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    advanceTurn: {
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
        state.agents += 1
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
      state.actionsCount = 0
      state.turn = 0
      state.agents = 0
      state.money = 0
    },
  },
})

export const { advanceTurn, hireAgent, setMoney, reset } = gameStateSlice.actions
export default gameStateSlice.reducer
