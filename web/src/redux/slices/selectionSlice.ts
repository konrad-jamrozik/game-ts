import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AgentId, LeadId, LeadInvestigationId, MissionId } from '../../lib/model/modelIds'
import type { UpgradeName } from '../../lib/data_tables/upgrades'

export type SelectionState = {
  agents: AgentId[]
  selectedLeadId?: LeadId
  selectedInvestigationId?: LeadInvestigationId
  selectedMissionId?: MissionId
  selectedUpgradeName?: UpgradeName
  viewMissionDetailsId?: MissionId
  viewCharts?: true
}

const initialState: SelectionState = {
  agents: [],
}

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setAgentSelection(state, action: PayloadAction<AgentId[]>) {
      state.agents = action.payload
    },
    clearAgentSelection(state) {
      state.agents = []
    },
    setLeadSelection(state, action: PayloadAction<LeadId>) {
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
    setMissionSelection(state, action: PayloadAction<MissionId>) {
      state.selectedMissionId = action.payload
    },
    clearMissionSelection(state) {
      delete state.selectedMissionId
    },
    setUpgradeSelection(state, action: PayloadAction<UpgradeName>) {
      state.selectedUpgradeName = action.payload
    },
    clearUpgradeSelection(state) {
      delete state.selectedUpgradeName
    },
    clearAllSelection(state) {
      state.agents = []
      delete state.selectedLeadId
      delete state.selectedInvestigationId
      delete state.selectedMissionId
      delete state.selectedUpgradeName
      delete state.viewMissionDetailsId
      delete state.viewCharts
    },
    setViewMissionDetails(state, action: PayloadAction<MissionId>) {
      state.viewMissionDetailsId = action.payload
    },
    clearViewMissionDetails(state) {
      delete state.viewMissionDetailsId
    },
    setViewCharts(state) {
      state.viewCharts = true
    },
    clearViewCharts(state) {
      delete state.viewCharts
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
  setMissionSelection,
  clearMissionSelection,
  setUpgradeSelection,
  clearUpgradeSelection,
  clearAllSelection,
  setViewMissionDetails,
  clearViewMissionDetails,
  setViewCharts,
  clearViewCharts,
} = selectionSlice.actions
export default selectionSlice.reducer
