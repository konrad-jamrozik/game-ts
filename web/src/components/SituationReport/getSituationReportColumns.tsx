import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import { EXPECTED_SITUATION_REPORT_COLUMN_WIDTH } from '../Common/widthConstants'
import { MyChip } from '../Common/MyChip'
import type { SituationReportRow } from '../SituationReportCard'

export function getSituationReportColumns(): GridColDef<SituationReportRow>[] {
  const columns: GridColDef<SituationReportRow>[] = [
    {
      field: 'metric',
      headerName: 'Metric',
      width: 120,
      renderCell: (params: GridRenderCellParams<SituationReportRow>): React.JSX.Element => (
        <span style={{ fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>{params.row.metric}</span>
      ),
    },
    { field: 'value', headerName: 'Value', width: 80 },
    {
      field: 'projected',
      headerName: 'Projected',
      width: 150,
      renderCell: (params: GridRenderCellParams<SituationReportRow>): React.JSX.Element => {
        const { diff, metric, projected, reverseColor } = params.row

        if (projected === undefined) {
          return <span />
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-label={`situation-report-row-${metric.toLowerCase().replaceAll(' ', '-')}-projected`}>
              {projected}
            </span>
            {diff !== undefined && <MyChip chipValue={diff} reverseColor={reverseColor ?? false} />}
          </div>
        )
      },
    },
  ]

  assertColumnWidth(columns, EXPECTED_SITUATION_REPORT_COLUMN_WIDTH, 'Situation Report')

  return columns
}
