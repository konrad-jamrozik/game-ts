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
import { f6c0, f6max, type Fixed6 } from '../../lib/primitives/fixed6'
import type { AgentId } from '../../lib/model/modelIds'
import {
  isAwayAgentForLeadsPanel,
  isExhaustedAgentForLeadsPanel,
  isReadyAgentForLeadsPanel,
  isRecoveringAgentForLeadsPanel,
} from '../../lib/model_utils/agentReadinessUtils'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearAgentSelection,
  setAgentSelection,
  setMissionsAgentsFilters,
  type LeadsAgentsFilterType,
} from '../../redux/slices/selectionSlice'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { DataGridCard } from '../Common/DataGridCard'
import { AGENTS_DEFAULT_VIEW_DATA_GRID_WIDTH } from '../Common/widthConstants'
import {
  calculateAgentsForLeadsGridTitleCounts,
  type AgentsForLeadsGridTitleCounts,
} from '../AgentsDataGrid/agentCounts'
import { AgentsDataGridTitle } from '../AgentsDataGrid/AgentsDataGridTitle'
import type { AgentRow } from '../AgentsDataGrid/getAgentsColumns'
import { getAgentsColumnsForMissions } from './getAgentsColumnsForMissions'

declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    missionsAgentsFilters?: LeadsAgentsFilterType[]
    missionsAgentsFilterCounts?: AgentsForLeadsGridTitleCounts
    onMissionsAgentsFiltersChange?: (filters: LeadsAgentsFilterType[]) => void
  }
}

const DEFAULT_MISSIONS_AGENTS_FILTERS: LeadsAgentsFilterType[] = ['ready']

export function AgentsDataGridForMissions(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const missionsAgentsFilters = useAppSelector(
    (state) => state.selection.missionsAgentsFilters ?? DEFAULT_MISSIONS_AGENTS_FILTERS,
  )

  React.useEffect(() => {
    if (!missionsAgentsFilters.includes('ready') && agentSelection.length > 0) {
      dispatch(clearAgentSelection())
    }
  }, [agentSelection.length, dispatch, missionsAgentsFilters])

  const allRows: AgentRow[] = gameState.agents.map((agent, index) => ({
    ...agent,
    rowId: index,
  }))
  const rows = filterMissionAgentRows(allRows, missionsAgentsFilters)
  const maxSkillAlive = getMaxSkillAlive(allRows)
  const columns = getAgentsColumnsForMissions(rows, maxSkillAlive, gameState.missions)

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const agentIds: AgentId[] = []
    const mgr = createRowSelectionManager(newSelectionModel)

    const existingRowIds = rows.map((row) => row.rowId)
    const includedRowIds = existingRowIds.filter((id) => mgr.has(id))

    for (const rowId of includedRowIds) {
      const row = rows.find((rowItem) => rowItem.rowId === rowId)
      if (row && isSelectableMissionAgentRow(row, missionsAgentsFilters)) {
        agentIds.push(row.id)
      }
    }

    dispatch(setAgentSelection(agentIds))
  }

  const rowIds: GridRowId[] = []
  if (missionsAgentsFilters.includes('ready')) {
    for (const agentId of agentSelection) {
      const row = rows.find((rowCandidate) => rowCandidate.id === agentId)
      if (row) {
        rowIds.push(row.rowId)
      }
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }
  const agentsForMissionsTitleCounts = calculateAgentsForLeadsGridTitleCounts(gameState.agents)
  const title = <AgentsDataGridTitle variant="leads" counts={agentsForMissionsTitleCounts} />

  return (
    <DataGridCard
      id="agents-for-missions"
      title={title}
      ariaLabel="Agents for missions"
      width={AGENTS_DEFAULT_VIEW_DATA_GRID_WIDTH}
      rows={rows}
      columns={columns}
      getRowId={(row: AgentRow) => row.rowId}
      checkboxSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<AgentRow>) =>
        isSelectableMissionAgentRow(params.row, missionsAgentsFilters)
      }
      slots={{
        toolbar: AgentsForMissionsToolbar,
        noRowsOverlay:
          missionsAgentsFilters.length === 0 ? PleaseSelectMissionsAgentFiltersOverlay : NoMissionsAgentsFoundOverlay,
      }}
      slotProps={{
        toolbar: {
          missionsAgentsFilters,
          missionsAgentsFilterCounts: agentsForMissionsTitleCounts,
          onMissionsAgentsFiltersChange: (filters: LeadsAgentsFilterType[]) =>
            dispatch(setMissionsAgentsFilters(filters)),
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

function AgentsForMissionsToolbar(props: {
  missionsAgentsFilters?: LeadsAgentsFilterType[]
  missionsAgentsFilterCounts?: AgentsForLeadsGridTitleCounts
  onMissionsAgentsFiltersChange?: (filters: LeadsAgentsFilterType[]) => void
}): React.JSX.Element {
  const {
    missionsAgentsFilters = DEFAULT_MISSIONS_AGENTS_FILTERS,
    missionsAgentsFilterCounts,
    onMissionsAgentsFiltersChange,
  } = props

  function handleFilterToggle(filter: LeadsAgentsFilterType, checked: boolean): void {
    if (checked) {
      onMissionsAgentsFiltersChange?.([...missionsAgentsFilters, filter])
      return
    }

    onMissionsAgentsFiltersChange?.(missionsAgentsFilters.filter((selectedFilter) => selectedFilter !== filter))
  }

  return (
    <Toolbar>
      <Box display="flex" alignItems="center" justifyContent="flex-end" width="100%">
        <FormControlLabel
          control={
            <Checkbox
              checked={missionsAgentsFilters.includes('ready')}
              onChange={(event) => handleFilterToggle('ready', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'toggle-missions-ready-filter' } }}
              size="small"
            />
          }
          label={`Ready (${missionsAgentsFilterCounts?.ready ?? 0})`}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={missionsAgentsFilters.includes('away')}
              onChange={(event) => handleFilterToggle('away', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'toggle-missions-away-filter' } }}
              size="small"
            />
          }
          label={`Away (${missionsAgentsFilterCounts?.away ?? 0})`}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={missionsAgentsFilters.includes('exhausted')}
              onChange={(event) => handleFilterToggle('exhausted', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'toggle-missions-exhausted-filter' } }}
              size="small"
            />
          }
          label={`Exhausted (${missionsAgentsFilterCounts?.exhausted ?? 0})`}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={missionsAgentsFilters.includes('recovering')}
              onChange={(event) => handleFilterToggle('recovering', event.target.checked)}
              slotProps={{ input: { 'aria-label': 'toggle-missions-recovering-filter' } }}
              size="small"
            />
          }
          label={`Recovering (${missionsAgentsFilterCounts?.recovering ?? 0})`}
        />
      </Box>
    </Toolbar>
  )
}

function PleaseSelectMissionsAgentFiltersOverlay(): React.JSX.Element {
  return (
    <GridOverlay>
      <Typography variant="body2" color="text.secondary" textAlign="center" px={2}>
        Please select at least one filter above
      </Typography>
    </GridOverlay>
  )
}

function NoMissionsAgentsFoundOverlay(): React.JSX.Element {
  return (
    <GridOverlay>
      <Typography variant="body2" color="text.secondary" textAlign="center" px={2}>
        No agents found using selected filters
      </Typography>
    </GridOverlay>
  )
}

function filterMissionAgentRows(
  allRows: readonly AgentRow[],
  filters: readonly LeadsAgentsFilterType[],
): AgentRow[] {
  return allRows.filter((agent) => filters.some((filter) => matchesMissionAgentFilter(agent, filter)))
}

function isSelectableMissionAgentRow(agent: AgentRow, filters: readonly LeadsAgentsFilterType[]): boolean {
  return filters.includes('ready') && isReadyAgentForLeadsPanel(agent)
}

function matchesMissionAgentFilter(agent: AgentRow, filter: LeadsAgentsFilterType): boolean {
  if (filter === 'ready') {
    return isReadyAgentForLeadsPanel(agent)
  }

  if (filter === 'away') {
    return isAwayAgentForLeadsPanel(agent)
  }

  if (filter === 'exhausted') {
    return isExhaustedAgentForLeadsPanel(agent)
  }

  return isRecoveringAgentForLeadsPanel(agent)
}

function getMaxSkillAlive(rows: readonly AgentRow[]): Fixed6 {
  const aliveRows = rows.filter((row) => row.state !== 'KIA' && row.state !== 'Sacked')
  return aliveRows.reduce((max, row) => f6max(max, row.skill), f6c0)
}
