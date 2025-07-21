import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SelectionState = {
  agents: string[]
}

const initialState: SelectionState = {
  agents: [],
}

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setAgentSelection(state, action: PayloadAction<string[]>) {
      state.agents = action.payload
    },
    clearAgentSelection(state) {
      state.agents = []
    },
  },
})

export const { setAgentSelection, clearAgentSelection } = selectionSlice.actions
export default selectionSlice.reducer
