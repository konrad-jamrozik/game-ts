import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SelectionState = {
  agents: string[]
  selectedLeadId?: string
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
    setLeadSelection(state, action: PayloadAction<string>) {
      state.selectedLeadId = action.payload
    },
    clearLeadSelection(state) {
      delete state.selectedLeadId
    },
  },
})

export const { setAgentSelection, clearAgentSelection, setLeadSelection, clearLeadSelection } = selectionSlice.actions
export default selectionSlice.reducer
