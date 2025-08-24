import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { MissionSiteId } from '../model/model'

export type SelectionState = {
  agents: string[]
  selectedLeadId?: string
  selectedMissionSiteId?: MissionSiteId
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
    setMissionSiteSelection(state, action: PayloadAction<MissionSiteId>) {
      state.selectedMissionSiteId = action.payload
    },
    clearMissionSelection(state) {
      delete state.selectedMissionSiteId
    },
    clearAllSelection(state) {
      state.agents = []
      delete state.selectedLeadId
      delete state.selectedMissionSiteId
    },
  },
})

export const {
  setAgentSelection,
  clearAgentSelection,
  setLeadSelection,
  clearLeadSelection,
  setMissionSiteSelection,
  clearMissionSelection,
  clearAllSelection,
} = selectionSlice.actions
export default selectionSlice.reducer
