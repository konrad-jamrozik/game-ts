import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowSelectionModel,
  type GridSortCellParams,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import type { Agent } from '../../lib/model/model'
import { setAgentSelection } from '../../lib/slices/selectionSlice'
import { DataGridCard } from '../DataGridCard'
import { AgentsToolbar } from './AgentsToolbar'
import { agV } from '../../lib/model/agents/AgentView'
import { assertDefined } from '../../lib/utils/assert'
import { div } from '../../lib/utils/mathUtils'

export type AgentRow = Agent & {
  // row id for DataGrid (required by MUI DataGrid)
  // https://mui.com/x/react-data-grid/row-definition/
  rowId: number
}

function createAgentColumns(rows: AgentRow[]): GridColDef[] {
  return [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label={`agents-row-agent-id-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label={`agents-row-state-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'assignment',
      headerName: 'Assignment',
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label={`agents-row-assignment-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'skill',
      headerName: 'Skill',
      minWidth: 140,
      sortComparator: (
        _v1: string,
        _v2: string,
        param1: GridSortCellParams<string>,
        param2: GridSortCellParams<string>,
      ): number => {
        // Sort by effective skill instead of baseline skill
        // Find the rows from our typed rows array using the row IDs
        const row1 = rows.find((row) => row.rowId === param1.id)
        const row2 = rows.find((row) => row.rowId === param2.id)

        assertDefined(row1, `Row not found for id: ${param1.id}`)
        assertDefined(row2, `Row not found for id: ${param2.id}`)

        const effectiveSkill1 = agV(row1).effectiveSkill()
        const effectiveSkill2 = agV(row2).effectiveSkill()

        // Primary sort: effective skill
        if (effectiveSkill1 !== effectiveSkill2) {
          return effectiveSkill1 - effectiveSkill2
        }

        // Secondary sort: baseline skill (if effective skills are equal)
        const baselineSkill1 = row1.skill
        const baselineSkill2 = row2.skill
        if (baselineSkill1 !== baselineSkill2) {
          return baselineSkill1 - baselineSkill2
        }

        // Tertiary sort: agent ID (for stable sorting)
        return row1.id.localeCompare(row2.id)
      },
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => {
        const effectiveSkill = agV(params.row).effectiveSkill()
        const baselineSkill = params.value ?? 0
        const percentage = baselineSkill > 0 ? (div(effectiveSkill, baselineSkill) * 100).toFixed(1) : '0.0'
        return (
          <div
            aria-label={`agents-row-skill-${params.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '3ch 1ch 3ch 7ch',
              gap: '5px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span style={{ textAlign: 'right' }}>{effectiveSkill}</span>
            <span style={{ textAlign: 'center' }}>/</span>
            <span style={{ textAlign: 'right' }}>{baselineSkill}</span>
            <span style={{ textAlign: 'right' }}>({percentage}%)</span>
          </div>
        )
      },
    },
    {
      field: 'exhaustion',
      headerName: 'Exhaustion',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label={`agents-row-exhaustion-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'hitPoints',
      headerName: 'HP',
      minWidth: 80,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <div
          aria-label={`agents-row-hit-points-${params.id}`}
          style={{
            display: 'grid',
            gridTemplateColumns: '2ch 1ch 2ch',
            gap: '2px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <span style={{ textAlign: 'right' }}>{params.value}</span>
          <span style={{ textAlign: 'center' }}>/</span>
          <span style={{ textAlign: 'right' }}>{params.row.maxHitPoints}</span>
        </div>
      ),
    },
    {
      field: 'recoveryTurns',
      headerName: 'Recovery',
      minWidth: 90,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label={`agents-row-recovery-${params.id}`}>
          {(params.value ?? 0) > 0 ? `${params.value} turns` : '-'}
        </span>
      ),
    },
    {
      field: 'missionsSurvived',
      headerName: 'Missions',
      width: 90,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label={`agents-row-missions-survived-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'turnHired',
      headerName: 'T. hired',
      width: 100,
      renderCell: (params: GridRenderCellParams<AgentRow, number>) => (
        <span aria-label={`agents-row-turn-hired-${params.id}`}>{params.value}</span>
      ),
    },
  ]
}

export function AgentsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const agentSelection = useAppSelector((state) => state.selection.agents)
  const [showOnlyTerminated, setShowOnlyTerminated] = React.useState(false)
  const [showOnlyAvailable, setShowOnlyAvailable] = React.useState(false)
  const [showDetailed, setShowDetailed] = React.useState(false)

  // Handlers that enforce mutual exclusivity between "Available" and "Terminated"
  const handleToggleAvailable = React.useCallback((checked: boolean) => {
    setShowOnlyAvailable(checked)
    if (checked) {
      setShowOnlyTerminated(false)
    }
  }, [])

  const handleToggleTerminated = React.useCallback((checked: boolean) => {
    setShowOnlyTerminated(checked)
    if (checked) {
      setShowOnlyAvailable(false)
    }
  }, [])

  // Transform agents array to include rowId for DataGrid
  const allRows: AgentRow[] = gameState.agents.map((agent, index) => ({
    ...agent,
    rowId: index,
  }))

  // Apply filtering based on checkboxes
  const rows: AgentRow[] = React.useMemo(() => {
    if (showOnlyAvailable) {
      return allRows.filter((agent) => agent.state === 'Available')
    }
    if (showOnlyTerminated) {
      return allRows.filter((agent) => agent.state === 'Terminated')
    }
    return allRows.filter((agent) => agent.state !== 'Terminated')
  }, [allRows, showOnlyTerminated, showOnlyAvailable])

  // Define and filter columns based on showDetailed state
  const visibleColumns = React.useMemo(() => {
    const columns = createAgentColumns(rows)
    // Filter columns based on showDetailed state
    return showDetailed ? columns : columns.filter((col) => col.field !== 'hitPoints' && col.field !== 'recoveryTurns')
  }, [rows, showDetailed])

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const agentIds: string[] = []
    const mgr = createRowSelectionManager(newSelectionModel)

    const existingRowIds = rows.map((row) => row.rowId)
    const includedRowIds = existingRowIds.filter((id) => mgr.has(id))

    for (const rowId of includedRowIds) {
      // Find the visible row whose stable rowId matches the selected id
      const row = rows.find((rowItem) => rowItem.rowId === rowId)
      if (row) {
        agentIds.push(row.id)
      } else {
        throw new Error(`Agent not found for rowId: ${rowId}`)
      }
    }

    dispatch(setAgentSelection(agentIds))
  }

  // Convert agent IDs from state back to row IDs for DataGrid
  const rowIds: GridRowId[] = []
  for (const agentId of agentSelection) {
    // Find the visible row that contains this agent ID
    const row = rows.find((rowCandidate) => rowCandidate.id === agentId)
    if (row) {
      // Use the stable rowId provided to DataGrid via getRowId
      rowIds.push(row.rowId)
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }

  return (
    <DataGridCard
      title="Agents"
      rows={rows}
      columns={visibleColumns}
      getRowId={(row: AgentRow) => row.rowId}
      checkboxSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      initialState={{
        columns: {
          columnVisibilityModel: {
            missionsSurvived: false,
            turnHired: false,
          },
        },
      }}
      slots={{ toolbar: AgentsToolbar }}
      slotProps={{
        toolbar: {
          showOnlyTerminated,
          onToggleTerminated: handleToggleTerminated,
          showOnlyAvailable,
          onToggleAvailable: handleToggleAvailable,
          showDetailed,
          onToggleDetailed: setShowDetailed,
        },
      }}
      showToolbar
    />
  )
}
