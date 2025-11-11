import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { calculateLeadSuccessChance } from '../lib/model/ruleset/ruleset'
import { StyledDataGrid } from './StyledDataGrid'
import { fmtNoPrefix, str } from '../lib/utils/formatUtils'
import { MyChip } from './MyChip'
import type { Bps } from '../lib/model/bps'
import { getLeadById } from '../lib/collections/leads'
import { ExpandableCard } from './ExpandableCard'

export type LeadInvestigationRow = {
  id: string
  leadInvestigationTitle: string
  intel: number
  successChance: Bps
  agents: number
  agentsInTransit: number
  turns: number
}

export function LeadInvestigationsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { leadInvestigations, agents } = gameState

  const leadInvestigationColumns: GridColDef[] = [
    { field: 'leadInvestigationTitle', headerName: 'Investigation', width: 200 },
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
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => (
        <span>{str(params.row.successChance)}</span>
      ),
    },
  ]

  const leadInvestigationRows: LeadInvestigationRow[] = Object.values(leadInvestigations).map((investigation) => {
    const lead = getLeadById(investigation.leadId)
    const successChance = calculateLeadSuccessChance(investigation.accumulatedIntel, lead.difficultyConstant)

    // Count agents actively working on this investigation (OnAssignment state)
    const activeAgents = agents.filter(
      (agent) => agent.assignment === investigation.id && agent.state === 'OnAssignment',
    ).length

    // Count agents in transit to this investigation
    const agentsInTransit = agents.filter(
      (agent) => agent.assignment === investigation.id && agent.state === 'InTransit',
    ).length

    return {
      id: investigation.id,
      leadInvestigationTitle: `${fmtNoPrefix(investigation.id, 'investigation-')} ${lead.title}`,
      intel: investigation.accumulatedIntel,
      successChance,
      agents: activeAgents,
      agentsInTransit,
      turns: investigation.turnsInvestigated,
    }
  })

  return (
    <ExpandableCard title={`Lead Investigations (${leadInvestigationRows.length})`} defaultExpanded={true}>
      <StyledDataGrid
        rows={leadInvestigationRows}
        columns={leadInvestigationColumns}
        aria-label="Lead investigations data"
      />
    </ExpandableCard>
  )
}

