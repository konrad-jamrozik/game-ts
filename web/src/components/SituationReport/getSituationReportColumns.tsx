import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { assertColumnWidth } from '../Common/assertColumnWidth'
import {
  SITUATION_REPORT_METRIC_WIDTH,
  SITUATION_REPORT_PROJECTED_WIDTH,
  SITUATION_REPORT_VALUE_WIDTH,
} from '../Common/columnWidths'
import { EXPECTED_SITUATION_REPORT_COLUMN_WIDTH } from '../Common/widthConstants'
import { MyChip } from '../Common/MyChip'
import type { SituationReportRow } from '../SituationReportCard'

export function getSituationReportColumns(): GridColDef<SituationReportRow>[] {
  const columns: GridColDef<SituationReportRow>[] = [
    { field: 'metric', headerName: 'Metric', width: SITUATION_REPORT_METRIC_WIDTH },
    { field: 'value', headerName: 'Value', width: SITUATION_REPORT_VALUE_WIDTH },
    {
      field: 'projected',
      headerName: 'Projected',
      width: SITUATION_REPORT_PROJECTED_WIDTH,
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
