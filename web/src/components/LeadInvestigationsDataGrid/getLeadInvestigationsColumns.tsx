import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { fmtPctDec2 } from '../../lib/primitives/formatPrimitives'
import { columnWidths } from '../Common/columnWidths'
import { MyChip } from '../Common/MyChip'
import type { LeadInvestigationRow } from './LeadInvestigationsDataGrid'

export function getLeadInvestigationsColumns(): GridColDef<LeadInvestigationRow>[] {
  const columns: GridColDef<LeadInvestigationRow>[] = [
    {
      field: 'leadInvestigationTitle',
      headerName: 'Investigation ID',
      width: columnWidths['lead_investigations.lead_investigation_title'],
    },
    {
      field: 'agents',
      headerName: 'Ag #',
      width: columnWidths['lead_investigations.agents'],
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
    {
      field: 'successChance',
      headerName: 'Succ %',
      width: columnWidths['lead_investigations.success_chance'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        if (params.row.state === 'Done') {
          return <MyChip chipValue="Done" />
        }
        if (params.row.state === 'Abandoned') {
          return <MyChip chipValue="Abandoned" reverseColor={true} />
        }
        return <span>{fmtPctDec2(params.row.successChance)}</span>
      },
    },
    {
      field: 'intel',
      headerName: 'Intel',
      width: columnWidths['lead_investigations.intel'],
      type: 'number',
    },

    {
      field: 'intelDecay',
      headerName: 'Decay',
      width: columnWidths['lead_investigations.intel_decay'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        const { intelDecayPct, intelDecay } = params.row
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
            <span style={{ textAlign: 'right' }}>{fmtPctDec2(intelDecayPct)}</span>
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
      width: columnWidths['lead_investigations.projected_intel'],
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

  return columns
}
