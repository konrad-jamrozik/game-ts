import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AgentId, FactionId, LeadId, LeadInvestigationId, MissionId } from '../../lib/model/modelIds'
import type { UpgradeName } from '../../lib/data_tables/upgrades'

export type LeadsFilterType = 'active' | 'inactive' | 'archived'
export type LeadsAgentsFilterType = 'ready' | 'away' | 'exhausted' | 'recovering'
export type ChartsTurnRangeFilter = 'all' | 'last100' | 'currentTurn'
export type AgentsFilterType = 'all' | 'ready' | 'exhausted' | 'away' | 'recovering' | 'terminated' | 'stats'
export type MissionsFilterType = 'all' | 'expiringSoon' | 'deployed' | 'archived'
export type LeadsDrilldownFilter = 'all' | 'available' | 'activeInvestigations'

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
  viewLeads?: true
  viewCharts?: true
  viewMissions?: true
  viewAgents?: true
  viewUpgrades?: true
  viewTurnReport?: true
  viewFactions?: true
  // Data grid filter states
  agentsFilterType?: AgentsFilterType
  missionsFilterType?: MissionsFilterType
  leadsDrilldownFilter?: LeadsDrilldownFilter
  selectedTurnReportTurn?: number
  selectedFactionId?: FactionId
  leadsFilterType?: LeadsFilterType
  leadsAgentsFilters?: LeadsAgentsFilterType[]
  missionsAgentsFilters?: LeadsAgentsFilterType[]
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
      delete state.viewLeads
      delete state.viewCharts
      delete state.viewMissions
      delete state.viewAgents
      delete state.viewUpgrades
      delete state.viewTurnReport
      delete state.viewFactions
      // Clear data grid filter states
      delete state.agentsFilterType
      delete state.missionsFilterType
      delete state.leadsDrilldownFilter
      delete state.selectedTurnReportTurn
      delete state.selectedFactionId
      delete state.leadsFilterType
      delete state.leadsAgentsFilters
      delete state.missionsAgentsFilters
      // Selections not deleted, i.e. preserved:
      // AI section selections (selectedAIIntellect, autoAdvanceTurn, and aiTurnCount)
    },
    setViewMissionDetails(state, action: PayloadAction<MissionId>) {
      state.viewMissionDetailsId = action.payload
      delete state.viewLeads
      delete state.viewCharts
      delete state.viewMissions
      delete state.viewAgents
      delete state.viewUpgrades
      delete state.viewTurnReport
      delete state.viewFactions
    },
    clearViewMissionDetails(state) {
      delete state.viewMissionDetailsId
    },
    setViewLeads(state) {
      state.viewLeads = true
      delete state.viewCharts
      delete state.viewMissions
      delete state.viewAgents
      delete state.viewUpgrades
      delete state.viewMissionDetailsId
      delete state.viewTurnReport
      delete state.viewFactions
    },
    clearViewLeads(state) {
      delete state.viewLeads
    },
    setViewCharts(state) {
      state.viewCharts = true
      delete state.viewLeads
      delete state.viewMissions
      delete state.viewAgents
      delete state.viewUpgrades
      delete state.viewMissionDetailsId
      delete state.viewTurnReport
      delete state.viewFactions
    },
    clearViewCharts(state) {
      delete state.viewCharts
    },
    setViewMissions(state) {
      state.viewMissions = true
      delete state.viewLeads
      delete state.viewCharts
      delete state.viewAgents
      delete state.viewUpgrades
      delete state.viewMissionDetailsId
      delete state.viewTurnReport
      delete state.viewFactions
    },
    clearViewMissions(state) {
      delete state.viewMissions
    },
    setViewAgents(state) {
      state.viewAgents = true
      delete state.viewLeads
      delete state.viewCharts
      delete state.viewMissions
      delete state.viewUpgrades
      delete state.viewMissionDetailsId
      delete state.viewTurnReport
      delete state.viewFactions
    },
    clearViewAgents(state) {
      delete state.viewAgents
    },
    setViewUpgrades(state) {
      state.viewUpgrades = true
      delete state.viewLeads
      delete state.viewCharts
      delete state.viewMissions
      delete state.viewAgents
      delete state.viewMissionDetailsId
      delete state.viewTurnReport
      delete state.viewFactions
    },
    clearViewUpgrades(state) {
      delete state.viewUpgrades
    },
    setViewTurnReport(state) {
      state.viewTurnReport = true
      delete state.viewLeads
      delete state.viewCharts
      delete state.viewMissions
      delete state.viewAgents
      delete state.viewUpgrades
      delete state.viewMissionDetailsId
      delete state.viewFactions
    },
    clearViewTurnReport(state) {
      delete state.viewTurnReport
    },
    setViewFactions(state) {
      state.viewFactions = true
      delete state.viewLeads
      delete state.viewCharts
      delete state.viewMissions
      delete state.viewAgents
      delete state.viewUpgrades
      delete state.viewMissionDetailsId
      delete state.viewTurnReport
    },
    clearViewFactions(state) {
      delete state.viewFactions
    },
    openAgentsDrilldown(state, action: PayloadAction<AgentsFilterType>) {
      setOnlyView(state, 'viewAgents')
      state.agentsFilterType = action.payload
    },
    openMissionsDrilldown(state, action: PayloadAction<MissionsFilterType>) {
      setOnlyView(state, 'viewMissions')
      state.missionsFilterType = action.payload
    },
    openLeadsDrilldown(state, action: PayloadAction<LeadsDrilldownFilter>) {
      setOnlyView(state, 'viewLeads')
      state.leadsFilterType = 'active'
      state.leadsDrilldownFilter = action.payload
    },
    openTurnReportDrilldown(state, action: PayloadAction<number>) {
      setOnlyView(state, 'viewTurnReport')
      state.selectedTurnReportTurn = action.payload
    },
    openFactionsDrilldown: {
      reducer(state, action: PayloadAction<FactionId | undefined>) {
        setOnlyView(state, 'viewFactions')
        if (action.payload === undefined) {
          delete state.selectedFactionId
        } else {
          state.selectedFactionId = action.payload
        }
      },
      prepare(factionId?: FactionId) {
        return { payload: factionId }
      },
    },
    openChartsDrilldown: {
      reducer(state, action: PayloadAction<ChartsTurnRangeFilter | undefined>) {
        setOnlyView(state, 'viewCharts')
        if (action.payload === undefined) {
          delete state.chartsTurnRangeFilter
        } else {
          state.chartsTurnRangeFilter = action.payload
        }
      },
      prepare(turnRangeFilter?: ChartsTurnRangeFilter) {
        return { payload: turnRangeFilter }
      },
    },
    openUpgradesDrilldown: {
      reducer(state, action: PayloadAction<UpgradeName | undefined>) {
        setOnlyView(state, 'viewUpgrades')
        if (action.payload === undefined) {
          delete state.selectedUpgradeName
        } else {
          state.selectedUpgradeName = action.payload
        }
      },
      prepare(upgradeName?: UpgradeName) {
        return { payload: upgradeName }
      },
    },
    // Data grid filter reducers
    setLeadsFilterType(state, action: PayloadAction<LeadsFilterType>) {
      state.leadsFilterType = action.payload
      state.leadsDrilldownFilter = 'all'
    },
    setLeadsAgentsFilters(state, action: PayloadAction<LeadsAgentsFilterType[]>) {
      state.leadsAgentsFilters = action.payload
    },
    setMissionsAgentsFilters(state, action: PayloadAction<LeadsAgentsFilterType[]>) {
      state.missionsAgentsFilters = action.payload
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
  setViewLeads,
  clearViewLeads,
  setViewCharts,
  clearViewCharts,
  setViewMissions,
  clearViewMissions,
  setViewAgents,
  clearViewAgents,
  setViewUpgrades,
  clearViewUpgrades,
  setViewTurnReport,
  clearViewTurnReport,
  setViewFactions,
  clearViewFactions,
  openAgentsDrilldown,
  openMissionsDrilldown,
  openLeadsDrilldown,
  openTurnReportDrilldown,
  openFactionsDrilldown,
  openChartsDrilldown,
  openUpgradesDrilldown,
  // Data grid filter actions
  setLeadsFilterType,
  setLeadsAgentsFilters,
  setMissionsAgentsFilters,
  setMissionsChartShowOffensive,
  setMissionsChartShowDefensive,
  setCombatRatingChartShowAgentCR,
  setCombatRatingChartShowMissionCR,
  setChartsTurnRangeFilter,
} = selectionSlice.actions
export default selectionSlice.reducer

type SelectionViewFlag =
  | 'viewLeads'
  | 'viewCharts'
  | 'viewMissions'
  | 'viewAgents'
  | 'viewUpgrades'
  | 'viewTurnReport'
  | 'viewFactions'

function setOnlyView(state: SelectionState, viewFlag: SelectionViewFlag): void {
  delete state.viewLeads
  delete state.viewCharts
  delete state.viewMissions
  delete state.viewAgents
  delete state.viewUpgrades
  delete state.viewTurnReport
  delete state.viewFactions
  delete state.viewMissionDetailsId
  state[viewFlag] = true
}
