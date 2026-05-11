import {
  createRowSelectionManager,
  type GridColDef,
  GridOverlay,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import type { Agent } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import type { Lead, LeadInvestigation } from '../../lib/model/leadModel'
import type { LeadId, LeadInvestigationId } from '../../lib/model/modelIds'
import { inTransitWithAssignmentId, investigatingAgents } from '../../lib/model_utils/agentUtils'
import { getDiscoveredLeads, getLeadStatus } from '../../lib/model_utils/leadUtils'
import { fmtDec1, fmtDec2 } from '../../lib/primitives/formatPrimitives'
import { ceil, floor } from '../../lib/primitives/mathPrimitives'
import { fmtLeadInvestigationIdDigits } from '../../lib/model_utils/formatUtils'
import {
  getLeadProgressFromAgents,
  getLeadTeamPower,
  getLeadTurnSuccessChanceRange,
  sumAgentEffectiveSkills,
} from '../../lib/ruleset/leadRuleset'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearInvestigationSelection,
  clearLeadSelection,
  setInvestigationSelection,
  setLeadSelection,
  setLeadsFilterType,
  type LeadsFilterType,
} from '../../redux/slices/selectionSlice'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { DataGridCard } from '../Common/DataGridCard'
import { MyChip } from '../Common/MyChip'
import { columnWidths } from '../Common/columnWidths'
import { LEADS_DATA_GRID_WIDTH } from '../Common/widthConstants'
import { calculateLeadCounts } from '../LeadsDataGrid/leadCounts'
import { normalizeLeadsFilterType } from '../LeadsDataGrid/leadFilterUtils'
import { leadRowTypeDisplay } from '../LeadsDataGrid/leadRowTypeDisplay'
import { LeadsDataGridTitle } from '../LeadsDataGrid/LeadsDataGridTitle'
import { LeadsDataGridToolbar } from '../LeadsDataGrid/LeadsDataGridToolbar'

export function LeadsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const selectedInvestigationId = useAppSelector((state) => state.selection.selectedInvestigationId)
  const filterType: LeadsFilterType = useAppSelector((state) => normalizeLeadsFilterType(state.selection.leadsFilterType))
  const gameState = useAppSelector(getCurrentTurnState)

  const discoveredLeads = getDiscoveredLeads(gameState)

  const allRows: LeadRow[] = bldLeadRows(discoveredLeads, gameState)
  const rows = allRows.filter((row) => row.status === filterType)
  const columns = getLeadColumns()

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const mgr = createRowSelectionManager(newSelectionModel)
    const existingRowIds = rows.map((row) => row.rowId)
    const selectedRowIds = existingRowIds.filter((id) => mgr.has(id))

    if (selectedRowIds.length === 0) {
      dispatch(clearLeadSelection())
      dispatch(clearInvestigationSelection())
    } else {
      const [rowId] = selectedRowIds
      const row = rows.find((rowItem) => rowItem.rowId === rowId)
      if (row?.investigationStatus === 'None' && row.status === 'active') {
        dispatch(clearInvestigationSelection())
        dispatch(setLeadSelection(row.id))
      } else if (
        row?.investigationStatus === 'Active' &&
        row.status === 'active' &&
        row.activeInvestigationId !== undefined
      ) {
        dispatch(clearLeadSelection())
        dispatch(setInvestigationSelection(row.activeInvestigationId))
      } else {
        dispatch(clearLeadSelection())
        dispatch(clearInvestigationSelection())
      }
    }
  }

  const rowIds: GridRowId[] = []
  if (selectedLeadId !== undefined) {
    const row = rows.find(
      (rowCandidate) => rowCandidate.id === selectedLeadId && rowCandidate.investigationStatus === 'None',
    )
    if (row) {
      rowIds.push(row.rowId)
    } else {
      dispatch(clearLeadSelection())
    }
  }
  if (selectedInvestigationId !== undefined) {
    const row = rows.find((rowCandidate) => rowCandidate.activeInvestigationId === selectedInvestigationId)
    if (row) {
      rowIds.push(row.rowId)
    } else {
      dispatch(clearInvestigationSelection())
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }
  const leadCounts = calculateLeadCounts(discoveredLeads, gameState)
  const title = <LeadsDataGridTitle counts={leadCounts} />

  return (
    <DataGridCard
      id="leads"
      title={title}
      width={LEADS_DATA_GRID_WIDTH}
      rows={rows}
      columns={columns}
      getRowId={(row: LeadRow) => row.rowId}
      checkboxSelection
      disableMultipleRowSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<LeadRow>) => !isRowDisabled(params.row)}
      slots={{ toolbar: LeadsDataGridToolbar, noRowsOverlay: NoLeadsFoundOverlay }}
      slotProps={{
        toolbar: {
          filterType,
          leadCounts,
          onFilterTypeChange: (type: LeadsFilterType) => dispatch(setLeadsFilterType(type)),
        },
      }}
      showToolbar
    />
  )
}

function NoLeadsFoundOverlay(): React.JSX.Element {
  return (
    <GridOverlay>
      <Typography variant="body2" color="text.secondary" textAlign="center" px={2}>
        No leads found using selected filters
      </Typography>
    </GridOverlay>
  )
}

type LeadInvestigationCellStatus = 'None' | 'Inactive' | 'Active' | 'Done' | 'Abandoned' | 'Obsolete'

type LeadRow = {
  rowId: GridRowId
  id: LeadId
  status: LeadsFilterType
  lead: string
  difficulty: number
  repeatable: boolean
  investigation: string
  investigationStatus: LeadInvestigationCellStatus
  activeInvestigationId?: LeadInvestigationId
  investigationIdDigits?: string
  agents?: number
  progress?: number
  projectedProgress?: number
  progressDiff?: number
  teamEfficiency?: number
  successChanceLower?: number
  successChanceUpper?: number
}

function bldLeadRows(leads: readonly Lead[], gameState: GameState): LeadRow[] {
  return leads.flatMap((lead) => bldLeadRowsForLead(lead, gameState))
}

function bldLeadRowsForLead(lead: Lead, gameState: GameState): LeadRow[] {
  const investigationsForLead = Object.values(gameState.leadInvestigations).filter(
    (investigation) => investigation.leadId === lead.id,
  )
  const activeInvestigation = investigationsForLead.find((investigation) => investigation.state === 'Active')
  const status = getLeadStatus(lead, gameState)
  const rowStatus = getLeadFilterType(status)

  const rowBase = {
    rowId: `lead:${lead.id}`,
    id: lead.id,
    status: rowStatus,
    lead: lead.name,
    difficulty: lead.difficulty,
    repeatable: lead.repeatable,
  }

  const archivedInvestigationRows = bldArchivedInvestigationRows(lead, investigationsForLead)

  if (rowStatus === 'inactive') {
    return [
      {
        ...rowBase,
        investigation: 'Inactive',
        investigationStatus: 'Inactive',
      },
      ...archivedInvestigationRows,
    ]
  }

  if (activeInvestigation !== undefined) {
    return [
      {
        ...rowBase,
        investigation: fmtActiveInvestigation(lead, gameState),
        investigationStatus: 'Active',
        activeInvestigationId: activeInvestigation.id,
        investigationIdDigits: fmtLeadInvestigationIdDigits(activeInvestigation.id),
        ...bldActiveInvestigationDetails(activeInvestigation, lead, gameState.agents),
      },
      ...archivedInvestigationRows,
    ]
  }

  if (rowStatus === 'archived') {
    if (hasArchivedInvestigationCorrespondingToArchivedLead(lead, investigationsForLead)) {
      return archivedInvestigationRows
    }

    return [
      {
        ...rowBase,
        rowId: `obsolete:${lead.id}`,
        investigation: 'Obsolete',
        investigationStatus: 'Obsolete',
      },
      ...archivedInvestigationRows,
    ]
  }

  return [
    {
      ...rowBase,
      investigation: 'None',
      investigationStatus: 'None',
    },
    ...archivedInvestigationRows,
  ]
}

function bldArchivedInvestigationRows(
  lead: Lead,
  investigationsForLead: readonly LeadInvestigation[],
): LeadRow[] {
  const terminal = investigationsForLead.filter((i) => i.state === 'Done' || i.state === 'Abandoned')

  return terminal.toSorted(compareLeadInvestigationsByCompletionTurn).map((investigation) => {
    if (investigation.state === 'Done') {
      return {
        rowId: `done:${investigation.id}`,
        id: lead.id,
        status: 'archived',
        lead: lead.name,
        difficulty: lead.difficulty,
        repeatable: lead.repeatable,
        investigation: fmtDoneInvestigation(investigation),
        investigationStatus: 'Done',
        investigationIdDigits: fmtLeadInvestigationIdDigits(investigation.id),
      } satisfies LeadRow
    }

    return {
      rowId: `abandoned:${investigation.id}`,
      id: lead.id,
      status: 'archived',
      lead: lead.name,
      difficulty: lead.difficulty,
      repeatable: lead.repeatable,
      investigation: 'Abandoned',
      investigationStatus: 'Abandoned',
      investigationIdDigits: fmtLeadInvestigationIdDigits(investigation.id),
    } satisfies LeadRow
  })
}

function hasArchivedInvestigationCorrespondingToArchivedLead(
  lead: Lead,
  investigationsForLead: readonly LeadInvestigation[],
): boolean {
  return !lead.repeatable && investigationsForLead.some((investigation) => investigation.state === 'Done')
}

function bldActiveInvestigationDetails(
  investigation: LeadInvestigation,
  lead: Lead,
  agents: Agent[],
): Pick<
  LeadRow,
  | 'agents'
  | 'progress'
  | 'projectedProgress'
  | 'progressDiff'
  | 'teamEfficiency'
  | 'successChanceLower'
  | 'successChanceUpper'
> {
  const agentsInvestigating = investigatingAgents(agents, investigation)
  const agentsInTransit = inTransitWithAssignmentId(agents, investigation.id)
  const progressGain = getLeadProgressFromAgents(agentsInvestigating)
  const projectedProgress = investigation.progress + progressGain
  const skillPower = sumAgentEffectiveSkills(agentsInvestigating) / 100
  const teamEfficiency = skillPower === 0 ? 0 : getLeadTeamPower(agentsInvestigating) / skillPower
  const successChanceRange = getLeadTurnSuccessChanceRange(investigation.progress, projectedProgress, lead.difficulty)

  return {
    agents: agentsInvestigating.length + agentsInTransit.length,
    progress: investigation.progress,
    projectedProgress,
    progressDiff: projectedProgress - investigation.progress,
    teamEfficiency,
    successChanceLower: successChanceRange.lower,
    successChanceUpper: successChanceRange.upper,
  }
}

function getLeadColumns(): GridColDef<LeadRow>[] {
  return [
    {
      field: 'lead',
      headerName: 'Lead',
      width: columnWidths['leads.lead'],
    },
    {
      field: 'difficulty',
      headerName: 'Diff.',
      width: columnWidths['leads.difficulty'],
    },
    {
      field: 'repeatable',
      headerName: 'Type',
      width: columnWidths['leads.repeatable'],
      renderCell: (params: GridRenderCellParams<LeadRow, boolean>) => (
        <span aria-label={`leads-row-type-${params.id}`}>{leadRowTypeDisplay(params.value === true)}</span>
      ),
    },
    {
      field: 'investigation',
      headerName: 'Investig.',
      width: columnWidths['leads.investigation'],
    },
    {
      field: 'investigationIdDigits',
      headerName: 'ID',
      width: columnWidths['leads.investigation_id'],
      renderCell: (params: GridRenderCellParams<LeadRow, string | undefined>) => params.value ?? '',
    },
    {
      field: 'agents',
      headerName: 'Agents',
      width: columnWidths['leads.agents'],
      renderCell: (params: GridRenderCellParams<LeadRow, number | undefined>) => fmtOptionalNumber(params.value),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: columnWidths['leads.progress'],
      renderCell: (params: GridRenderCellParams<LeadRow, number | undefined>): string => {
        if (params.value === undefined) {
          return ''
        }
        return `${fmtDec1(params.value)}/${params.row.difficulty}`
      },
    },
    {
      field: 'progressDiff',
      headerName: 'Projected',
      width: columnWidths['leads.projected'],
      renderCell: (params: GridRenderCellParams<LeadRow, number | undefined>): string => {
        if (params.value === undefined) {
          return ''
        }
        return fmtSignedProjectedDelta(params.value)
      },
    },
    {
      field: 'teamEfficiency',
      headerName: 'Eff.',
      width: columnWidths['leads.efficiency'],
      renderCell: (params: GridRenderCellParams<LeadRow, number | undefined>): string => {
        if (params.value === undefined) {
          return ''
        }
        return `${floor(params.value * 100)}%`
      },
    },
    {
      field: 'successChance',
      headerName: 'Success %',
      width: columnWidths['leads.success_chance'],
      renderCell: (params: GridRenderCellParams<LeadRow>): React.JSX.Element | string => {
        if (params.row.investigationStatus === 'Done') {
          return <MyChip chipValue="Done" />
        }
        if (params.row.investigationStatus === 'Abandoned') {
          return <MyChip chipValue="Abandoned" reverseColor={true} />
        }
        if (params.row.investigationStatus === 'Obsolete') {
          return <MyChip chipValue="Obsolete" noColor={true} />
        }
        return fmtSuccessChanceSummary(params.row)
      },
    },
  ]
}

function getLeadFilterType(status: ReturnType<typeof getLeadStatus>): LeadsFilterType {
  if (status.isArchived) {
    return 'archived'
  }
  if (status.isInactive) {
    return 'inactive'
  }
  return 'active'
}

function fmtActiveInvestigation(lead: Lead, gameState: GameState): string {
  if (!lead.repeatable) {
    return 'Active'
  }

  const ordinal = (gameState.leadInvestigationCounts[lead.id] ?? 0) + 1
  return `Active #${ordinal}`
}

function fmtDoneInvestigation(investigation: LeadInvestigation): string {
  if (investigation.completionTurn === undefined) {
    return 'Done'
  }

  const paddedTurn = `${investigation.completionTurn}`.padStart(3).replaceAll(' ', '\u00A0')
  return `Done T ${paddedTurn}`
}

function compareLeadInvestigationsByCompletionTurn(
  investigationA: LeadInvestigation,
  investigationB: LeadInvestigation,
): number {
  return (investigationA.completionTurn ?? investigationA.startTurn) - (investigationB.completionTurn ?? investigationB.startTurn)
}

function fmtOptionalNumber(value: number | undefined): string {
  if (value === undefined) {
    return ''
  }
  return `${value}`
}

function fmtSignedProjectedDelta(value: number): string {
  if (value === 0) {
    return '0.00'
  }
  return value > 0 ? `+${fmtDec2(value)}` : `-${fmtDec2(Math.abs(value))}`
}

function fmtSuccessChanceSummary(row: LeadRow): string {
  if (row.successChanceLower === undefined || row.successChanceUpper === undefined) {
    return ''
  }

  const midpoint = (row.successChanceLower + row.successChanceUpper) / 2
  const halfWidth = (row.successChanceUpper - row.successChanceLower) / 2
  return `~${floor(midpoint * 100)}% +/- ${ceil(halfWidth * 100)}%`
}

function isRowDisabled(row: LeadRow): boolean {
  return row.status !== 'active'
}
