import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type GameState = {
  turn: number
  agents: number
  money: number
}

const initialState: GameState = {
  turn: 0,
  agents: 0,
  money: 100,
}

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    setTurn(state, action: PayloadAction<number>) {
      state.turn = action.payload
    },
    setAgents(state, action: PayloadAction<number>) {
      state.agents = action.payload
    },
    setMoney(state, action: PayloadAction<number>) {
      state.money = action.payload
    },
    reset(state) {
      state.turn = 0
      state.agents = 0
      state.money = 100
    },
  },
})

export const { setTurn, setAgents, setMoney, reset } = gameStateSlice.actions
export default gameStateSlice.reducer
