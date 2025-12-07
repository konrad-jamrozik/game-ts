import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import { columnWidths } from '../Common/columnWidths'
import { EXPECTED_SITUATION_REPORT_COLUMN_WIDTH } from '../Common/widthConstants'
import { MyChip } from '../Common/MyChip'
import type { SituationReportRow } from '../SituationReportCard'

export function getSituationReportColumns(): GridColDef<SituationReportRow>[] {
  const columns: GridColDef<SituationReportRow>[] = [
    { field: 'metric', headerName: 'Metric', width: columnWidths['situation_report.metric'] },
    { field: 'value', headerName: 'Value', width: columnWidths['situation_report.value'] },
    {
      field: 'projected',
      headerName: 'Projected',
      width: columnWidths['situation_report.projected'],
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
