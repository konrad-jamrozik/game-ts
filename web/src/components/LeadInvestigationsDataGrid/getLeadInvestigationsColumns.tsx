import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { fmtPctDec2 } from '../../lib/primitives/formatPrimitives'
import { MyChip } from '../Common/MyChip'
import type { LeadInvestigationRow } from './LeadInvestigationsDataGrid'

const EXPECTED_TOTAL_COLUMN_WIDTH = 660

export function getLeadInvestigationsColumns(): GridColDef<LeadInvestigationRow>[] {
  const columns: GridColDef<LeadInvestigationRow>[] = [
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
        return <span>{fmtPctDec2(params.row.successChance)}</span>
      },
    },
    {
      field: 'intelDecay',
      headerName: 'Intel decay',
      width: 140,
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

  const actualTotalWidth = columns.reduce((sum, col) => sum + (col.width ?? 0), 0)
  if (actualTotalWidth !== EXPECTED_TOTAL_COLUMN_WIDTH) {
    throw new Error(
      `LeadInvestigations columns total width mismatch: expected ${EXPECTED_TOTAL_COLUMN_WIDTH}, got ${actualTotalWidth}`,
    )
  }

  return columns
}
