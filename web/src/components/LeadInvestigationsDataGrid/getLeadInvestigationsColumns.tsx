import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { fmtPctDec2 } from '../../lib/primitives/formatPrimitives'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import { columnWidths } from '../Common/columnWidths'
import { EXPECTED_LEAD_INVESTIGATIONS_COLUMN_WIDTH } from '../Common/widthConstants'
import { MyChip } from '../Common/MyChip'
import type { LeadInvestigationRow } from './LeadInvestigationsDataGrid'

export function getLeadInvestigationsColumns(): GridColDef<LeadInvestigationRow>[] {
  const columns: GridColDef<LeadInvestigationRow>[] = [
    {
      field: 'leadInvestigationTitle',
      headerName: 'Investigation ID',
      width: columnWidths['lead_investigations.lead_investigation_title_width'],
    },
    {
      field: 'agents',
      headerName: 'Ag#',
      width: columnWidths['lead_investigations.agents_width'],
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
      field: 'intel',
      headerName: 'Intel',
      width: columnWidths['lead_investigations.intel_width'],
      type: 'number',
    },
    {
      field: 'successChance',
      headerName: 'Succ. %',
      width: columnWidths['lead_investigations.success_chance_width'],
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => {
        if (params.row.state === 'Successful') {
          return <MyChip chipValue="Done" />
        }
        if (params.row.state === 'Abandoned') {
          return <MyChip chipValue="Failed" reverseColor={true} />
        }
        return <span>{fmtPctDec2(params.row.successChance)}</span>
      },
    },
    {
      field: 'intelDecay',
      headerName: 'Intel decay',
      width: columnWidths['lead_investigations.intel_decay_width'],
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
      width: columnWidths['lead_investigations.projected_intel_width'],
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

  assertColumnWidth(columns, EXPECTED_LEAD_INVESTIGATIONS_COLUMN_WIDTH, 'LeadInvestigations')

  return columns
}
