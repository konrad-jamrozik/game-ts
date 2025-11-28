import {
  type GridColDef,
  type GridRenderCellParams,
  type GridRowId,
  type GridRowParams,
  type GridRowSelectionModel,
  createRowSelectionManager,
} from '@mui/x-data-grid'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getLeadById } from '../lib/collections/leads'
import { agsV } from '../lib/model/agents/AgentsView'
import { agV } from '../lib/model/agents/AgentView'
import { bps, toBpsFloor, type Bps } from '../lib/model/bps'
import { f2addToInt } from '../lib/model/fixed2'
import type { LeadInvestigationId } from '../lib/model/model'
import { AGENT_ESPIONAGE_INTEL } from '../lib/model/ruleset/constants'
import {
  calculateLeadIntelDecay,
  calculateLeadIntelDecayRounded,
  calculateLeadSuccessChance,
} from '../lib/model/ruleset/leadRuleset'
import {
  clearInvestigationSelection,
  clearLeadSelection,
  setInvestigationSelection,
} from '../lib/slices/selectionSlice'
import { fmtNoPrefix, str } from '../lib/utils/formatUtils'
import { calculateAgentSkillBasedValue } from '../lib/model/ruleset/skillRuleset'
import { filterLeadInvestigationRows } from '../lib/utils/dataGridUtils'
import { ExpandableCard } from './ExpandableCard'
import { LeadInvestigationsToolbar } from './LeadInvestigationsToolbar'
import { MyChip } from './MyChip'
import { StyledDataGrid } from './StyledDataGrid'
import { getCompletedInvestigationIds } from '../lib/utils/turnReportUtils'

export type LeadInvestigationRow = {
  id: LeadInvestigationId
  rowId: number
  leadInvestigationTitle: string
  intel: number
  successChance: number
  agents: number
  agentsInTransit: number
  startTurn: number
  intelDecayPercent: Bps
  intelDecay: number
  projectedIntel: number
  intelDiff: number
  state: 'Active' | 'Successful' | 'Abandoned'
  completedThisTurn: boolean
}

export function LeadInvestigationsDataGrid(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { leadInvestigations, agents, turnStartReport } = gameState
  const selectedInvestigationId = useAppSelector((state) => state.selection.selectedInvestigationId)
  const [showActive, setShowActive] = React.useState(true)
  const [showDone, setShowDone] = React.useState(false)
  const [showAbandoned, setShowAbandoned] = React.useState(false)

  const completedThisTurnIds = getCompletedInvestigationIds(turnStartReport)

  const leadInvestigationColumns: GridColDef<LeadInvestigationRow>[] = [
    { field: 'leadInvestigationTitle', headerName: 'Investigation ID', width: 200 },
    {
      field: 'agents',
      headerName: 'Ag#',
      width: 80,
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        const { agents: activeAgentCount, agentsInTransit } = params.row
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{activeAgentCount}</span>
            {agentsInTransit > 0 && <MyChip chipValue={`+${agentsInTransit}`} />}
          </div>
        )
      },
    },
    { field: 'intel', headerName: 'Intel', width: 40, type: 'number' },
    {
      field: 'successChance',
      headerName: 'Succ. %',
      width: 80,
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        if (params.row.state === 'Successful') {
          return <MyChip chipValue="Done" />
        }
        if (params.row.state === 'Abandoned') {
          return <MyChip chipValue="Failed" reverseColor={true} />
        }
        return <span>{str(toBpsFloor(params.row.successChance))}</span>
      },
    },
    {
      field: 'intelDecay',
      headerName: 'Intel decay',
      width: 140,
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        const { intelDecayPercent, intelDecay } = params.row
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: intelDecay > 0 ? 'auto auto auto auto' : 'auto',
              gap: '5px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span style={{ textAlign: 'right' }}>{str(intelDecayPercent)}</span>
            {intelDecay > 0 && (
              <>
                <span style={{ textAlign: 'center' }}>=</span>
                <MyChip chipValue={-intelDecay} />
              </>
            )}
          </div>
        )
      },
    },
    {
      field: 'projectedIntel',
      headerName: 'Proj. intel',
      width: 120,
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        const { projectedIntel, intelDiff } = params.row
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{projectedIntel}</span>
            {intelDiff !== 0 && <MyChip chipValue={intelDiff} />}
          </div>
        )
      },
    },
  ]

  // Create all rows from investigations
  const allInvestigationRows: LeadInvestigationRow[] = Object.values(leadInvestigations).map((investigation, index) => {
    const lead = getLeadById(investigation.leadId)
    const successChance = calculateLeadSuccessChance(investigation.accumulatedIntel, lead.difficulty)

    // Count agents actively working on this investigation (OnAssignment state)
    const activeAgents = agents.filter(
      (agent) => agent.assignment === investigation.id && agent.state === 'OnAssignment',
    ).length

    // Count agents in transit to this investigation
    const agentsInTransit = agents.filter(
      (agent) => agent.assignment === investigation.id && agent.state === 'InTransit',
    ).length

    // For Successful investigations, skip projected intel calculations
    let intelDecayPercent: Bps = bps(0)
    let intelDecay = 0
    let projectedIntel: number = investigation.accumulatedIntel
    let intelDiff = 0

    if (investigation.state === 'Active') {
      // Calculate intel decay (using shared helper function)
      intelDecay = calculateLeadIntelDecayRounded(investigation.accumulatedIntel)
      intelDecayPercent = calculateLeadIntelDecay(investigation.accumulatedIntel)

      // Calculate projected intel (reusing logic from updateLeadInvestigations)
      // Apply decay first
      projectedIntel = Math.max(0, investigation.accumulatedIntel - intelDecay)
      // Then accumulate new intel from assigned agents
      const investigatingAgents = agsV(agents)
        .withIds(investigation.agentIds)
        .toAgentArray()
        .filter((agent) => agent.assignment === investigation.id && agent.state === 'OnAssignment')
      for (const agent of investigatingAgents) {
        const intelFromAgent = calculateAgentSkillBasedValue(agV(agent), AGENT_ESPIONAGE_INTEL)
        projectedIntel = f2addToInt(projectedIntel, intelFromAgent)
      }

      // Calculate diff for chip display
      intelDiff = projectedIntel - investigation.accumulatedIntel
    }

    const rowState: 'Active' | 'Successful' | 'Abandoned' =
      investigation.state === 'Active' ? 'Active' : investigation.state === 'Successful' ? 'Successful' : 'Abandoned'
    const completedThisTurn = completedThisTurnIds.has(investigation.id)

    return {
      id: investigation.id,
      rowId: index,
      leadInvestigationTitle: `${fmtNoPrefix(investigation.id, 'investigation-')} ${lead.title}`,
      intel: investigation.accumulatedIntel,
      successChance,
      agents: activeAgents,
      agentsInTransit,
      startTurn: investigation.startTurn,
      intelDecayPercent,
      intelDecay,
      projectedIntel,
      intelDiff,
      state: rowState,
      completedThisTurn,
    }
  })

  // Filter rows based on checkbox states
  const leadInvestigationRows: LeadInvestigationRow[] = filterLeadInvestigationRows(
    allInvestigationRows,
    showActive,
    showDone,
    showAbandoned,
  )

  function handleRowSelectionChange(newSelectionModel: GridRowSelectionModel): void {
    const mgr = createRowSelectionManager(newSelectionModel)
    const existingRowIds = leadInvestigationRows.map((row) => row.rowId)
    const selectedRowIds = existingRowIds.filter((id) => mgr.has(id))

    if (selectedRowIds.length === 0) {
      dispatch(clearInvestigationSelection())
    } else {
      // We assume disableMultipleRowSelection, so we assume there is exactly one rowId in selectedRowIds
      const [rowId] = selectedRowIds
      const row = leadInvestigationRows.find((rowItem) => rowItem.rowId === rowId)
      if (row?.state === 'Active') {
        // Only allow selection of Active investigations
        // Clear lead selection when investigation is selected
        dispatch(clearLeadSelection())
        dispatch(setInvestigationSelection(row.id))
      } else {
        // If trying to select any other investigation, clear selection
        dispatch(clearInvestigationSelection())
      }
    }
  }

  // Convert selected investigation ID back to row ID for DataGrid
  const rowIds: GridRowId[] = []
  if (selectedInvestigationId !== undefined) {
    const row = leadInvestigationRows.find((rowCandidate) => rowCandidate.id === selectedInvestigationId)
    if (row) {
      rowIds.push(row.rowId)
    }
  }

  const idsSet = new Set<GridRowId>(rowIds)
  const model: GridRowSelectionModel = { type: 'include', ids: idsSet }

  return (
    <ExpandableCard title={`Lead Investigations (${leadInvestigationRows.length})`} defaultExpanded={true}>
      <StyledDataGrid
        rows={leadInvestigationRows}
        columns={leadInvestigationColumns}
        aria-label="Lead investigations data"
        checkboxSelection
        disableMultipleRowSelection
        onRowSelectionModelChange={handleRowSelectionChange}
        rowSelectionModel={model}
        getRowId={(row: LeadInvestigationRow) => row.rowId}
        isRowSelectable={(params: GridRowParams<LeadInvestigationRow>) => params.row.state === 'Active'}
        slots={{ toolbar: LeadInvestigationsToolbar }}
        slotProps={{
          toolbar: {
            showActive,
            onToggleActive: setShowActive,
            showDone,
            onToggleDone: setShowDone,
            showAbandoned,
            onToggleAbandoned: setShowAbandoned,
          },
        }}
        showToolbar
      />
    </ExpandableCard>
  )
}
