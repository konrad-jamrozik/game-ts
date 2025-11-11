import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { calculateIntelDecayPercent, calculateLeadSuccessChance } from '../lib/model/ruleset/ruleset'
import { StyledDataGrid } from './StyledDataGrid'
import { fmtNoPrefix, str } from '../lib/utils/formatUtils'
import { MyChip } from './MyChip'
import { bps, type Bps } from '../lib/model/bps'
import { getLeadById } from '../lib/collections/leads'
import { ExpandableCard } from './ExpandableCard'
import { floor } from '../lib/utils/mathUtils'
import { AGENT_ESPIONAGE_INTEL } from '../lib/model/ruleset/constants'
import { agsV } from '../lib/model/agents/AgentsView'

export type LeadInvestigationRow = {
  id: string
  leadInvestigationTitle: string
  intel: number
  successChance: Bps
  agents: number
  agentsInTransit: number
  turns: number
  intelDecay: Bps
  intelDecayAmount: number
  projectedIntel: number
  intelDiff: number
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
    {
      field: 'intelDecay',
      headerName: 'Intel decay',
      width: 140,
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        const { intelDecay, intelDecayAmount } = params.row
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: intelDecayAmount > 0 ? 'auto auto auto auto' : 'auto',
              gap: '5px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span style={{ textAlign: 'right' }}>{str(intelDecay)}</span>
            {intelDecayAmount > 0 && (
              <>
                <span style={{ textAlign: 'center' }}>=</span>
                <MyChip chipValue={-intelDecayAmount} />
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

    // Calculate intel decay (reusing logic from updateLeadInvestigations)
    const decayBps = calculateIntelDecayPercent(investigation.accumulatedIntel)
    const intelDecayAmount = floor((investigation.accumulatedIntel * decayBps) / 10_000)

    // Calculate projected intel (reusing logic from updateLeadInvestigations)
    // Apply decay first
    let projectedIntel = Math.max(0, investigation.accumulatedIntel - intelDecayAmount)
    // Then accumulate new intel from assigned agents
    const investigatingAgents = agsV(agents)
      .withIds(investigation.agentIds)
      .toAgentArray()
      .filter((agent) => agent.assignment === investigation.id && agent.state === 'OnAssignment')
    for (const agent of investigatingAgents) {
      const effectiveSkill = agent.skill - agent.exhaustion
      projectedIntel += floor((AGENT_ESPIONAGE_INTEL * effectiveSkill) / 100)
    }

    // Calculate diff for chip display
    const intelDiff = projectedIntel - investigation.accumulatedIntel

    return {
      id: investigation.id,
      leadInvestigationTitle: `${fmtNoPrefix(investigation.id, 'investigation-')} ${lead.title}`,
      intel: investigation.accumulatedIntel,
      successChance,
      agents: activeAgents,
      agentsInTransit,
      turns: investigation.turnsInvestigated,
      intelDecay: bps(decayBps),
      intelDecayAmount,
      projectedIntel,
      intelDiff,
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
