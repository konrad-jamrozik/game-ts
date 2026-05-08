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
import { getCurrentTurnState } from '../../redux/storeUtils'
import {
  clearInvestigationSelection,
  clearLeadSelection,
  setInvestigationSelection,
  setLeadSelection,
} from '../../redux/slices/selectionSlice'
import { columnWidths } from '../Common/columnWidths'
import { DataGridCard } from '../Common/DataGridCard'
import { CURRENT_LEADS_DATA_GRID_WIDTH } from '../Common/widthConstants'
import { calculateLeadCounts } from '../LeadsDataGrid/leadCounts'
import { LeadsDataGridTitle } from '../LeadsDataGrid/LeadsDataGridTitle'

export function CurrentLeadsDataGrid2(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const selectedInvestigationId = useAppSelector((state) => state.selection.selectedInvestigationId)
  const gameState = useAppSelector(getCurrentTurnState)

  const discoveredLeads = getDiscoveredLeads(gameState)

  const rows: CurrentLeadRow2[] = bldCurrentLeadRows2(discoveredLeads, gameState)
  const columns = getCurrentLeadColumns2()

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
      if (row?.investigationStatus === 'None') {
        dispatch(clearInvestigationSelection())
        dispatch(setLeadSelection(row.id))
      } else if (row?.investigationStatus === 'Active' && row.activeInvestigationId !== undefined) {
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
    const row = rows.find((rowCandidate) => rowCandidate.id === selectedLeadId && rowCandidate.investigationStatus === 'None')
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
      id="current-leads-2"
      title={title}
      width={CURRENT_LEADS_DATA_GRID_WIDTH}
      rows={rows}
      columns={columns}
      getRowId={(row: CurrentLeadRow2) => row.rowId}
      checkboxSelection
      disableMultipleRowSelection
      onRowSelectionModelChange={handleRowSelectionChange}
      rowSelectionModel={model}
      isRowSelectable={(params: GridRowParams<CurrentLeadRow2>) => !isRowDisabled(params.row)}
    />
  )
}

type CurrentLeadInvestigationStatus2 = 'None' | 'Blocked' | 'Active' | 'Done'

type CurrentLeadRow2 = {
  rowId: number
  id: LeadId
  lead: string
  difficulty: number
  repeatable: boolean
  investigation: string
  investigationStatus: CurrentLeadInvestigationStatus2
  activeInvestigationId?: LeadInvestigationId
  agents?: number
  progress?: number
  projectedProgress?: number
  progressDiff?: number
  teamEfficiency?: number
  successChanceLower?: number
  successChanceUpper?: number
}

function bldCurrentLeadRows2(leads: readonly Lead[], gameState: GameState): CurrentLeadRow2[] {
  const rows: CurrentLeadRow2[] = []

  for (const lead of leads) {
    const status = getLeadStatus(lead, gameState)
    if (status.isArchived) {
      continue
    }

    rows.push(bldCurrentLeadRow2(lead, rows.length, gameState))
  }

  return rows
}

function bldCurrentLeadRow2(lead: Lead, rowId: number, gameState: GameState): CurrentLeadRow2 {
  const investigationsForLead = Object.values(gameState.leadInvestigations).filter(
    (investigation) => investigation.leadId === lead.id,
  )
  const activeInvestigation = investigationsForLead.find((investigation) => investigation.state === 'Active')
  const doneInvestigation = investigationsForLead.find((investigation) => investigation.state === 'Done')
  const status = getLeadStatus(lead, gameState)

  const rowBase = {
    rowId,
    id: lead.id,
    lead: lead.name,
    difficulty: lead.difficulty,
    repeatable: lead.repeatable,
  }

  if (status.isInactive) {
    return {
      ...rowBase,
      investigation: 'Blocked',
      investigationStatus: 'Blocked',
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

  if (!lead.repeatable && doneInvestigation !== undefined) {
    return {
      ...rowBase,
      investigation: 'Done',
      investigationStatus: 'Done',
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
  CurrentLeadRow2,
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

function getCurrentLeadColumns2(): GridColDef<CurrentLeadRow2>[] {
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
      headerName: 'Rpt.',
      width: columnWidths['current_leads.repeatable'],
      renderCell: (params: GridRenderCellParams<CurrentLeadRow2, boolean>) => (
        <span aria-label={`current-leads-row-repeatable-${params.id}`}>{params.value === true ? 'Yes' : 'No'}</span>
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
      renderCell: (params: GridRenderCellParams<CurrentLeadRow2, number | undefined>) =>
        fmtOptionalNumber(params.value),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: columnWidths['current_leads.progress'],
      renderCell: (params: GridRenderCellParams<CurrentLeadRow2, number | undefined>): string => {
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
      renderCell: (params: GridRenderCellParams<CurrentLeadRow2, number | undefined>): string => {
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
      renderCell: (params: GridRenderCellParams<CurrentLeadRow2, number | undefined>): string => {
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
      renderCell: (params: GridRenderCellParams<CurrentLeadRow2>) => fmtSuccessChanceRange2(params.row),
    },
  ]
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

function fmtSuccessChanceRange2(row: CurrentLeadRow2): string {
  if (row.successChanceLower === undefined || row.successChanceUpper === undefined) {
    return ''
  }

  const midpoint = (row.successChanceLower + row.successChanceUpper) / 2
  const halfWidth = (row.successChanceUpper - row.successChanceLower) / 2
  return `~${floor(midpoint * 100)}% +/- ${ceil(halfWidth * 100)}%`
}

function isRowDisabled(row: CurrentLeadRow2): boolean {
  return row.investigationStatus !== 'None' && row.investigationStatus !== 'Active'
}
