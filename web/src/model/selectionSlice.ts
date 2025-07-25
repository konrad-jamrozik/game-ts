import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SelectionState = {
  agents: string[]
  selectedLead?: string
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
      state.selectedLead = action.payload
    },
    clearLeadSelection(state) {
      delete state.selectedLead
    },
  },
})

export const { setAgentSelection, clearAgentSelection, setLeadSelection, clearLeadSelection } = selectionSlice.actions
export default selectionSlice.reducer
