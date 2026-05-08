import {
  createRowSelectionManager,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import * as React from 'react'
import type { Agent } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import type { Lead, LeadInvestigation } from '../../lib/model/leadModel'
import type { LeadId, LeadInvestigationId } from '../../lib/model/modelIds'
import { inTransitWithAssignmentId, investigatingAgents } from '../../lib/model_utils/agentUtils'
import { getDiscoveredLeads, getLeadStatus } from '../../lib/model_utils/leadUtils'
import { fmtDec1, fmtDec2 } from '../../lib/primitives/formatPrimitives'
import { ceil, floor } from '../../lib/primitives/mathPrimitives'
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
import { columnWidths } from '../Common/columnWidths'
import { CURRENT_LEADS_DATA_GRID_WIDTH } from '../Common/widthConstants'
import { calculateLeadCounts } from '../LeadsDataGrid/leadCounts'
import { leadRowTypeDisplay } from '../LeadsDataGrid/leadRowTypeDisplay'
import { LeadsDataGridTitle } from '../LeadsDataGrid/LeadsDataGridTitle'
import { LeadsDataGridToolbar } from '../LeadsDataGrid/LeadsDataGridToolbar'

export function LeadsDataGrid2(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const selectedInvestigationId = useAppSelector((state) => state.selection.selectedInvestigationId)
  const filterType = useAppSelector((state) => state.selection.leadsFilterType ?? 'active')
  const gameState = useAppSelector(getCurrentTurnState)

  const discoveredLeads = getDiscoveredLeads(gameState)

  const allRows: LeadRow2[] = bldLeadRows2(discoveredLeads, gameState)
  const rows = allRows.filter((row) => row.status === filterType)
  const columns = getLeadColumns2()

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
      id="leads-2"
      title={title}
      width={CURRENT_LEADS_DATA_GRID_WIDTH}
      rows={rows}
      columns={columns}
      getRowId={(row: LeadRow2) => row.rowId}
      checkboxSelection
      disableMultipleRowSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<LeadRow2>) => !isRowDisabled(params.row)}
      slots={{ toolbar: LeadsDataGridToolbar }}
      slotProps={{
        toolbar: {
          filterType,
          onFilterTypeChange: (type: LeadsFilterType) => dispatch(setLeadsFilterType(type)),
        },
      }}
      showToolbar
    />
  )
}

type LeadInvestigationStatus2 = 'None' | 'Inactive' | 'Active'

type LeadRow2 = {
  rowId: number
  id: LeadId
  status: LeadsFilterType
  lead: string
  difficulty: number
  repeatable: boolean
  investigation: string
  investigationStatus: LeadInvestigationStatus2
  activeInvestigationId?: LeadInvestigationId
  agents?: number
  progress?: number
  projectedProgress?: number
  progressDiff?: number
  teamEfficiency?: number
  successChanceLower?: number
  successChanceUpper?: number
}

function bldLeadRows2(leads: readonly Lead[], gameState: GameState): LeadRow2[] {
  return leads.map((lead, index) => bldLeadRow2(lead, index, gameState))
}

function bldLeadRow2(lead: Lead, rowId: number, gameState: GameState): LeadRow2 {
  const investigationsForLead = Object.values(gameState.leadInvestigations).filter(
    (investigation) => investigation.leadId === lead.id,
  )
  const activeInvestigation = investigationsForLead.find((investigation) => investigation.state === 'Active')
  const status = getLeadStatus(lead, gameState)
  const rowStatus = getLeadFilterType2(status)

  const rowBase = {
    rowId,
    id: lead.id,
    status: rowStatus,
    lead: lead.name,
    difficulty: lead.difficulty,
    repeatable: lead.repeatable,
  }

  if (rowStatus === 'inactive') {
    return {
      ...rowBase,
      investigation: 'Inactive',
      investigationStatus: 'Inactive',
    }
  }

  if (activeInvestigation !== undefined) {
    return {
      ...rowBase,
      investigation: fmtActiveInvestigation(lead, gameState),
      investigationStatus: 'Active',
      activeInvestigationId: activeInvestigation.id,
      ...bldActiveInvestigationDetails2(activeInvestigation, lead, gameState.agents),
    }
  }

  return {
    ...rowBase,
    investigation: 'None',
    investigationStatus: 'None',
  }
}

function bldActiveInvestigationDetails2(
  investigation: LeadInvestigation,
  lead: Lead,
  agents: Agent[],
): Pick<
  LeadRow2,
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

function getLeadColumns2(): GridColDef<LeadRow2>[] {
  return [
    {
      field: 'lead',
      headerName: 'Lead',
      width: columnWidths['current_leads.lead'],
    },
    {
      field: 'difficulty',
      headerName: 'Diff.',
      width: columnWidths['current_leads.difficulty'],
    },
    {
      field: 'repeatable',
      headerName: 'Type',
      width: columnWidths['current_leads.repeatable'],
      renderCell: (params: GridRenderCellParams<LeadRow2, boolean>) => (
        <span aria-label={`leads-row-type-${params.id}`}>{leadRowTypeDisplay(params.value === true)}</span>
      ),
    },
    {
      field: 'investigation',
      headerName: 'Investig.',
      width: columnWidths['current_leads.investigation'],
    },
    {
      field: 'agents',
      headerName: 'Agents',
      width: columnWidths['current_leads.agents'],
      renderCell: (params: GridRenderCellParams<LeadRow2, number | undefined>) => fmtOptionalNumber(params.value),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: columnWidths['current_leads.progress'],
      renderCell: (params: GridRenderCellParams<LeadRow2, number | undefined>): string => {
        if (params.value === undefined) {
          return ''
        }
        return `${fmtDec1(params.value)}/${params.row.difficulty}`
      },
    },
    {
      field: 'progressDiff',
      headerName: 'Projected',
      width: columnWidths['current_leads.projected'],
      renderCell: (params: GridRenderCellParams<LeadRow2, number | undefined>): string => {
        if (params.value === undefined) {
          return ''
        }
        return fmtSignedDec2(params.value)
      },
    },
    {
      field: 'teamEfficiency',
      headerName: 'Eff.',
      width: columnWidths['current_leads.efficiency'],
      renderCell: (params: GridRenderCellParams<LeadRow2, number | undefined>): string => {
        if (params.value === undefined) {
          return ''
        }
        return `${floor(params.value * 100)}%`
      },
    },
    {
      field: 'successChance',
      headerName: 'Success %',
      width: columnWidths['current_leads.success_chance'],
      renderCell: (params: GridRenderCellParams<LeadRow2>) => fmtSuccessChanceRange2(params.row),
    },
  ]
}

function getLeadFilterType2(status: ReturnType<typeof getLeadStatus>): LeadsFilterType {
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

function fmtOptionalNumber(value: number | undefined): string {
  if (value === undefined) {
    return ''
  }
  return `${value}`
}

function fmtSignedDec2(value: number): string {
  if (value === 0) {
    return '0.00'
  }
  return value > 0 ? `+${fmtDec2(value)}` : `-${fmtDec2(Math.abs(value))}`
}

function fmtSuccessChanceRange2(row: LeadRow2): string {
  if (row.successChanceLower === undefined || row.successChanceUpper === undefined) {
    return ''
  }

  const midpoint = (row.successChanceLower + row.successChanceUpper) / 2
  const halfWidth = (row.successChanceUpper - row.successChanceLower) / 2
  return `~${floor(midpoint * 100)}% +/- ${ceil(halfWidth * 100)}%`
}

function isRowDisabled(row: LeadRow2): boolean {
  return row.status !== 'active'
}
