import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AgentId, LeadId, LeadInvestigationId, MissionId } from '../../lib/model/modelIds'
import type { UpgradeName } from '../../lib/data_tables/upgrades'

export type LeadsFilterType = 'active' | 'inactive' | 'archived'
export type ChartsTurnRangeFilter = 'all' | 'last100' | 'currentTurn'

export type SelectionState = {
  agents: AgentId[]
  selectedLeadId?: LeadId
  selectedInvestigationId?: LeadInvestigationId
  selectedMissionId?: MissionId
  selectedUpgradeName?: UpgradeName
  selectedAIIntellect?: string
  autoAdvanceTurn?: boolean
  aiTurnCount?: number
  viewMissionDetailsId?: MissionId
  viewCharts?: true
  // Data grid filter states
  missionsShowArchived?: boolean
  leadsFilterType?: LeadsFilterType
  investigationsShowActive?: boolean
  investigationsShowDone?: boolean
  investigationsShowAbandoned?: boolean
  agentsShowTerminated?: boolean
  agentsShowAvailable?: boolean
  agentsShowRecovering?: boolean
  agentsShowStats?: boolean
  missionsChartShowOffensive?: boolean
  missionsChartShowDefensive?: boolean
  combatRatingChartShowAgentCR?: boolean
  combatRatingChartShowMissionCR?: boolean
  chartsTurnRangeFilter?: ChartsTurnRangeFilter
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
    setAIIntellectSelection(state, action: PayloadAction<string>) {
      state.selectedAIIntellect = action.payload
    },
    clearAIIntellectSelection(state) {
      delete state.selectedAIIntellect
    },
    setAutoAdvanceTurn(state, action: PayloadAction<boolean>) {
      state.autoAdvanceTurn = action.payload
    },
    clearAutoAdvanceTurn(state) {
      delete state.autoAdvanceTurn
    },
    setAITurnCount(state, action: PayloadAction<number>) {
      state.aiTurnCount = action.payload
    },
    clearAITurnCount(state) {
      delete state.aiTurnCount
    },
    clearAllSelection(state) {
      state.agents = []
      delete state.selectedLeadId
      delete state.selectedInvestigationId
      delete state.selectedMissionId
      delete state.selectedUpgradeName
      delete state.viewMissionDetailsId
      delete state.viewCharts
      // Clear data grid filter states
      delete state.missionsShowArchived
      delete state.leadsFilterType
      delete state.investigationsShowActive
      delete state.investigationsShowDone
      delete state.investigationsShowAbandoned
      delete state.agentsShowTerminated
      delete state.agentsShowAvailable
      delete state.agentsShowRecovering
      delete state.agentsShowStats
      // Selections not deleted, i.e. preserved:
      // AI section selections (selectedAIIntellect, autoAdvanceTurn, and aiTurnCount)
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
    // Data grid filter reducers
    setMissionsShowArchived(state, action: PayloadAction<boolean>) {
      state.missionsShowArchived = action.payload
    },
    setLeadsFilterType(state, action: PayloadAction<LeadsFilterType>) {
      state.leadsFilterType = action.payload
    },
    setInvestigationsShowActive(state, action: PayloadAction<boolean>) {
      state.investigationsShowActive = action.payload
    },
    setInvestigationsShowDone(state, action: PayloadAction<boolean>) {
      state.investigationsShowDone = action.payload
    },
    setInvestigationsShowAbandoned(state, action: PayloadAction<boolean>) {
      state.investigationsShowAbandoned = action.payload
    },
    setAgentsShowTerminated(state, action: PayloadAction<boolean>) {
      state.agentsShowTerminated = action.payload
    },
    setAgentsShowAvailable(state, action: PayloadAction<boolean>) {
      state.agentsShowAvailable = action.payload
    },
    setAgentsShowRecovering(state, action: PayloadAction<boolean>) {
      state.agentsShowRecovering = action.payload
    },
    setAgentsShowStats(state, action: PayloadAction<boolean>) {
      state.agentsShowStats = action.payload
    },
    setMissionsChartShowOffensive(state, action: PayloadAction<boolean>) {
      state.missionsChartShowOffensive = action.payload
    },
    setMissionsChartShowDefensive(state, action: PayloadAction<boolean>) {
      state.missionsChartShowDefensive = action.payload
    },
    setCombatRatingChartShowAgentCR(state, action: PayloadAction<boolean>) {
      state.combatRatingChartShowAgentCR = action.payload
    },
    setCombatRatingChartShowMissionCR(state, action: PayloadAction<boolean>) {
      state.combatRatingChartShowMissionCR = action.payload
    },
    setChartsTurnRangeFilter(state, action: PayloadAction<ChartsTurnRangeFilter>) {
      state.chartsTurnRangeFilter = action.payload
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
  setAIIntellectSelection,
  clearAIIntellectSelection,
  setAutoAdvanceTurn,
  clearAutoAdvanceTurn,
  setAITurnCount,
  clearAITurnCount,
  clearAllSelection,
  setViewMissionDetails,
  clearViewMissionDetails,
  setViewCharts,
  clearViewCharts,
  // Data grid filter actions
  setMissionsShowArchived,
  setLeadsFilterType,
  setInvestigationsShowActive,
  setInvestigationsShowDone,
  setInvestigationsShowAbandoned,
  setAgentsShowTerminated,
  setAgentsShowAvailable,
  setAgentsShowRecovering,
  setAgentsShowStats,
  setMissionsChartShowOffensive,
  setMissionsChartShowDefensive,
  setCombatRatingChartShowAgentCR,
  setCombatRatingChartShowMissionCR,
  setChartsTurnRangeFilter,
} = selectionSlice.actions
export default selectionSlice.reducer
