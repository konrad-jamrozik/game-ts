import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SelectionState = {
  agents: string[]
  selectedLeadId?: string
  selectedMissionId?: string
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
    setMissionSelection(state, action: PayloadAction<string>) {
      state.selectedMissionId = action.payload
    },
    clearMissionSelection(state) {
      delete state.selectedMissionId
    },
    clearAllSelection(state) {
      state.agents = []
      delete state.selectedLeadId
      delete state.selectedMissionId
    },
  },
})

export const {
  setAgentSelection,
  clearAgentSelection,
  setLeadSelection,
  clearLeadSelection,
  setMissionSelection,
  clearMissionSelection,
  clearAllSelection,
} = selectionSlice.actions
export default selectionSlice.reducer
