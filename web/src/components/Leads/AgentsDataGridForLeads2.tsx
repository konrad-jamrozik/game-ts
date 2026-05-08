import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import {
  createRowSelectionManager,
  GridOverlay,
  Toolbar,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import { f6c0, f6ge, f6lt, f6max, toF6, type Fixed6 } from '../../lib/primitives/fixed6'
import type { AgentId } from '../../lib/model/modelIds'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearAgentSelection,
  setAgentSelection,
  setLeadsAgentsFilters,
  type LeadsAgentsFilterType,
} from '../../redux/slices/selectionSlice'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { DataGridCard } from '../Common/DataGridCard'
import { AGENTS_DEFAULT_VIEW_DATA_GRID_WIDTH } from '../Common/widthConstants'
import { calculateAgentCounts } from '../AgentsDataGrid/agentCounts'
import { AgentsDataGridTitle } from '../AgentsDataGrid/AgentsDataGridTitle'
import { filterVisibleAgentColumns } from '../AgentsDataGrid/AgentsDataGridUtils'
import { getAgentsColumns, type AgentRow } from '../AgentsDataGrid/getAgentsColumns'

declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    leadsAgentsFilters?: LeadsAgentsFilterType[]
    onLeadsAgentsFiltersChange?: (filters: LeadsAgentsFilterType[]) => void
  }
}

const DEFAULT_LEADS_AGENTS_FILTERS: LeadsAgentsFilterType[] = ['ready']

export function AgentsDataGridForLeads2(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const leadsAgentsFilters = useAppSelector((state) => state.selection.leadsAgentsFilters ?? DEFAULT_LEADS_AGENTS_FILTERS)

  React.useEffect(() => {
    if (!leadsAgentsFilters.includes('ready') && agentSelection.length > 0) {
      dispatch(clearAgentSelection())
    }
  }, [agentSelection.length, dispatch, leadsAgentsFilters])

  const allRows: AgentRow[] = gameState.agents.map((agent, index) => ({
    ...agent,
    rowId: index,
  }))
  const rows = filterLeadAgentRows2(allRows, leadsAgentsFilters)
  const maxSkillAlive = getMaxSkillAlive2(allRows)
  const columns = getAgentsColumns(
    rows,
    maxSkillAlive,
    gameState.missions,
    gameState.turn,
    gameState.hitPointsRecoveryPct,
  )
  const visibleColumns = filterVisibleAgentColumns(columns, false, false, false)

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const agentIds: AgentId[] = []
    const mgr = createRowSelectionManager(newSelectionModel)

    const existingRowIds = rows.map((row) => row.rowId)
    const includedRowIds = existingRowIds.filter((id) => mgr.has(id))

    for (const rowId of includedRowIds) {
      const row = rows.find((rowItem) => rowItem.rowId === rowId)
      if (row && isSelectableLeadAgentRow2(row, leadsAgentsFilters)) {
        agentIds.push(row.id)
      }
    }

    dispatch(setAgentSelection(agentIds))
  }

  const rowIds: GridRowId[] = []
  if (leadsAgentsFilters.includes('ready')) {
    for (const agentId of agentSelection) {
      const row = rows.find((rowCandidate) => rowCandidate.id === agentId)
      if (row) {
        rowIds.push(row.rowId)
      }
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }
  const agentCounts = calculateAgentCounts(gameState.agents)
  const title = <AgentsDataGridTitle counts={agentCounts} />

  return (
    <DataGridCard
      id="agents-for-leads-2"
      title={title}
      ariaLabel="Agents for leads"
      width={AGENTS_DEFAULT_VIEW_DATA_GRID_WIDTH}
      rows={rows}
      columns={visibleColumns}
      getRowId={(row: AgentRow) => row.rowId}
      checkboxSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<AgentRow>) => isSelectableLeadAgentRow2(params.row, leadsAgentsFilters)}
      slots={{
        toolbar: AgentsForLeadsToolbar2,
        ...(leadsAgentsFilters.length === 0 ? { noRowsOverlay: PleaseSelectLeadAgentFiltersOverlay } : {}),
      }}
      slotProps={{
        toolbar: {
          leadsAgentsFilters,
          onLeadsAgentsFiltersChange: (filters: LeadsAgentsFilterType[]) => dispatch(setLeadsAgentsFilters(filters)),
        },
      }}
      showToolbar
      sx={{
        '& .agents-color-bar-cell': {
          padding: '4px',
        },
      }}
    />
  )
}

function AgentsForLeadsToolbar2(props: {
  leadsAgentsFilters?: LeadsAgentsFilterType[]
  onLeadsAgentsFiltersChange?: (filters: LeadsAgentsFilterType[]) => void
}): React.JSX.Element {
  const { leadsAgentsFilters = DEFAULT_LEADS_AGENTS_FILTERS, onLeadsAgentsFiltersChange } = props

  function handleFilterToggle(filter: LeadsAgentsFilterType, checked: boolean): void {
    if (checked) {
      onLeadsAgentsFiltersChange?.([...leadsAgentsFilters, filter])
      return
    }

    onLeadsAgentsFiltersChange?.(leadsAgentsFilters.filter((selectedFilter) => selectedFilter !== filter))
  }

  return (
    <Toolbar>
      <Box display="flex" alignItems="center" justifyContent="flex-end" width="100%">
        <FormControlLabel
          control={
            <Checkbox
              checked={leadsAgentsFilters.includes('ready')}
              onChange={(event) => handleFilterToggle('ready', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'toggle-leads-ready-filter' } }}
              size="small"
            />
          }
          label="Ready"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={leadsAgentsFilters.includes('away')}
              onChange={(event) => handleFilterToggle('away', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'toggle-leads-away-filter' } }}
              size="small"
            />
          }
          label="Away"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={leadsAgentsFilters.includes('exhausted')}
              onChange={(event) => handleFilterToggle('exhausted', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'toggle-leads-exhausted-filter' } }}
              size="small"
            />
          }
          label="Exhausted"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={leadsAgentsFilters.includes('recovering')}
              onChange={(event) => handleFilterToggle('recovering', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'toggle-leads-recovering-filter' } }}
              size="small"
            />
          }
          label="Recovering"
        />
      </Box>
    </Toolbar>
  )
}

function PleaseSelectLeadAgentFiltersOverlay(): React.JSX.Element {
  return (
    <GridOverlay>
      <Typography variant="body2" color="text.secondary" textAlign="center" px={2}>
        Please select at least one filter above
      </Typography>
    </GridOverlay>
  )
}

function filterLeadAgentRows2(
  allRows: readonly AgentRow[],
  filters: readonly LeadsAgentsFilterType[],
): AgentRow[] {
  return allRows.filter((agent) => filters.some((filter) => matchesLeadAgentFilter2(agent, filter)))
}

function isSelectableLeadAgentRow2(agent: AgentRow, filters: readonly LeadsAgentsFilterType[]): boolean {
  return filters.includes('ready') && isReadyLeadAgentRow2(agent)
}

function matchesLeadAgentFilter2(agent: AgentRow, filter: LeadsAgentsFilterType): boolean {
  if (filter === 'ready') {
    return isReadyLeadAgentRow2(agent)
  }

  if (filter === 'away') {
    return (
      agent.assignment !== 'Recovery' &&
      (agent.state === 'InTransit' ||
        agent.state === 'Contracting' ||
        agent.state === 'Investigating' ||
        agent.state === 'OnMission')
    )
  }

  if (filter === 'exhausted') {
    return isAssignableLeadAgentAssignment2(agent) && agent.state !== 'InTransit' && f6ge(agent.exhaustionPct, toF6(30))
  }

  return agent.state === 'Recovering'
}

function isReadyLeadAgentRow2(agent: AgentRow): boolean {
  return isAssignableLeadAgentAssignment2(agent) && agent.state !== 'InTransit' && f6lt(agent.exhaustionPct, toF6(30))
}

function isAssignableLeadAgentAssignment2(agent: AgentRow): boolean {
  return agent.assignment === 'Standby' || agent.assignment === 'Training'
}

function getMaxSkillAlive2(rows: readonly AgentRow[]): Fixed6 {
  const aliveRows = rows.filter((row) => row.state !== 'KIA' && row.state !== 'Sacked')
  return aliveRows.reduce((max, row) => f6max(max, row.skill), f6c0)
}
