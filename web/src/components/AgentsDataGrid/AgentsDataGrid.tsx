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
import type { Agent, AgentState, GameState } from '../../lib/model/model'
import { setAgentSelection } from '../../lib/slices/selectionSlice'
import { DataGridCard } from '../DataGridCard'
import { AgentsToolbar } from './AgentsToolbar'
import { agV } from '../../lib/model/agents/AgentView'
import { assertDefined } from '../../lib/utils/assert'
import { filterAgentRows, filterVisibleAgentColumns } from '../../lib/utils/dataGridUtils'
import { toPct } from '../../lib/utils/mathUtils'
import { fmtDec1, fmtMissionSiteIdWithMissionId, fmtNoPrefix } from '../../lib/utils/formatUtils'
import { MyChip } from '../MyChip'
import { getModelPalette } from '../../styling/modelPaletteUtils'

export type AgentRow = Agent & {
  // row id for DataGrid (required by MUI DataGrid)
  // https://mui.com/x/react-data-grid/row-definition/
  rowId: number
}

// oxlint-disable-next-line max-lines-per-function
// eslint-disable-next-line max-lines-per-function
function createAgentColumns(
  rows: AgentRow[],
  showOnlyTerminated: boolean,
  missionSites: GameState['missionSites'],
): GridColDef[] {
  // For terminated agents, show only specific columns
  if (showOnlyTerminated) {
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
        field: 'skill',
        headerName: 'Skill',
        width: 40,
        renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
          <span aria-label={`agents-row-skill-${params.id}`}>{params.row.skill}</span>
        ),
      },
      {
        field: 'hp',
        headerName: 'HP',
        width: 40,
        renderCell: (params: GridRenderCellParams<AgentRow, unknown>): React.JSX.Element => (
          <span aria-label={`agents-row-hp-${params.id}`}>{params.row.maxHitPoints}</span>
        ),
      },
      {
        field: 'service',
        headerName: 'Service',
        width: 80,
        renderCell: (params: GridRenderCellParams<AgentRow, unknown>): React.JSX.Element => {
          const { turnHired, turnTerminated } = params.row
          if (turnTerminated === undefined) {
            return <span aria-label={`agents-row-service-${params.id}`}>-</span>
          }
          const totalTurnsServed = turnTerminated - turnHired + 1
          return (
            <span aria-label={`agents-row-service-${params.id}`}>
              {turnHired} - {turnTerminated} ({totalTurnsServed})
            </span>
          )
        },
      },
      {
        field: 'mission',
        headerName: 'Mission',
        width: 220,
        renderCell: (params: GridRenderCellParams<AgentRow, unknown>): React.JSX.Element => {
          const { terminatedOnMissionSiteId, assignment } = params.row

          if (terminatedOnMissionSiteId !== undefined) {
            const missionSite = missionSites.find((site) => site.id === terminatedOnMissionSiteId)
            if (missionSite !== undefined) {
              const displayValue = fmtMissionSiteIdWithMissionId(missionSite)
              return <span aria-label={`agents-row-mission-${params.id}`}>{displayValue}</span>
            }
          }
          // If agent was sacked (assignment is 'Sacked'), show "-"
          if (assignment === 'Sacked') {
            return <span aria-label={`agents-row-mission-${params.id}`}>-</span>
          }
          // Fallback (shouldn't happen for terminated agents, but just in case)
          return <span aria-label={`agents-row-mission-${params.id}`}>-</span>
        },
      },
      {
        field: 'by',
        headerName: 'By',
        width: 180,
        renderCell: (params: GridRenderCellParams<AgentRow, unknown>): React.JSX.Element => {
          const { terminatedBy, assignment } = params.row
          // If agent was terminated by an enemy, show the enemy ID without prefix
          if (terminatedBy !== undefined) {
            const displayValue = fmtNoPrefix(terminatedBy, 'enemy-')
            return <span aria-label={`agents-row-by-${params.id}`}>{displayValue}</span>
          }
          // If agent was sacked (assignment is 'Sacked'), show "-"
          if (assignment === 'Sacked') {
            return <span aria-label={`agents-row-by-${params.id}`}>-</span>
          }
          // Fallback (shouldn't happen for terminated agents, but just in case)
          return <span aria-label={`agents-row-by-${params.id}`}>-</span>
        },
      },
    ]
  }

  // For non-terminated agents, show all columns
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
      width: 140,
      renderCell: (params: GridRenderCellParams<AgentRow, AgentState>): React.JSX.Element => {
        const state = params.value
        if (state === undefined) {
          return <span aria-label={`agents-row-state-${params.id}`}>-</span>
        }
        const paletteColorName = getModelPalette()[state]
        return (
          <span aria-label={`agents-row-state-${params.id}`}>
            <MyChip chipValue={state} paletteColorName={paletteColorName} />
          </span>
        )
      },
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
        const percentage = baselineSkill > 0 ? fmtDec1(toPct(effectiveSkill, baselineSkill)) : '0.0'
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
  const [showRecovering, setShowRecovering] = React.useState(false)

  // Handlers that enforce mutual exclusivity: only one checkbox can be selected at a time
  function handleToggleAvailable(checked: boolean): void {
    setShowOnlyAvailable(checked)
    if (checked) {
      setShowOnlyTerminated(false)
      setShowRecovering(false)
    }
  }

  function handleToggleTerminated(checked: boolean): void {
    setShowOnlyTerminated(checked)
    if (checked) {
      setShowOnlyAvailable(false)
      setShowRecovering(false)
    }
  }

  function handleToggleRecovering(checked: boolean): void {
    setShowRecovering(checked)
    if (checked) {
      setShowOnlyTerminated(false)
      setShowOnlyAvailable(false)
    }
  }

  // Get IDs of agents terminated during the last turn advancement from turnStartReport
  const agentsReport = gameState.turnStartReport?.assets.agentsReport
  const terminatedIds = agentsReport && 'terminatedAgentIds' in agentsReport ? agentsReport.terminatedAgentIds : []
  const agentsTerminatedThisTurnIds = new Set<string>(terminatedIds)

  // Transform agents array to include rowId for DataGrid
  const allRows: AgentRow[] = gameState.agents.map((agent, index) => ({
    ...agent,
    rowId: index,
  }))

  // Apply filtering based on checkboxes
  const rows: AgentRow[] = filterAgentRows(
    allRows,
    showOnlyTerminated,
    showOnlyAvailable,
    showRecovering,
    agentsTerminatedThisTurnIds,
  )

  // Define columns based on whether we're showing terminated agents
  const columns = createAgentColumns(rows, showOnlyTerminated, gameState.missionSites)
  // For terminated agents, show all columns (they're already filtered in createAgentColumns)
  // For non-terminated agents, filter based on showRecovering state
  const visibleColumns = showOnlyTerminated ? columns : filterVisibleAgentColumns(columns, showRecovering)

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
          showRecovering,
          onToggleRecovering: handleToggleRecovering,
        },
      }}
      showToolbar
    />
  )
}
