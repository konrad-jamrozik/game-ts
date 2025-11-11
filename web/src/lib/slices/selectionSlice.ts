import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LeadInvestigationId, MissionSiteId } from '../model/model'

export type SelectionState = {
  agents: string[]
  selectedLeadId?: string
  selectedInvestigationId?: LeadInvestigationId
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
    setInvestigationSelection(state, action: PayloadAction<LeadInvestigationId>) {
      state.selectedInvestigationId = action.payload
    },
    clearInvestigationSelection(state) {
      delete state.selectedInvestigationId
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
      delete state.selectedInvestigationId
      delete state.selectedMissionSiteId
    },
  },
})

export const {
  setAgentSelection,
  clearAgentSelection,
  setLeadSelection,
  clearLeadSelection,
  setInvestigationSelection,
  clearInvestigationSelection,
  setMissionSiteSelection,
  clearMissionSelection,
  clearAllSelection,
} = selectionSlice.actions
export default selectionSlice.reducer
