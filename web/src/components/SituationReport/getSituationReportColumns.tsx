import type { GridCellParams, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { columnWidths } from '../Common/columnWidths'
import { ColorBar } from '../ColorBar/ColorBar'

export type SituationReportRow = {
  id: number
  metric: string
  value: string
  diff?: string
  reverseColor?: boolean
  panicPct?: number
}

export function getSituationReportColumns(): GridColDef<SituationReportRow>[] {
  const columns: GridColDef<SituationReportRow>[] = [
    { field: 'metric', headerName: 'Metric', width: columnWidths['situation_report.metric'] },
    {
      field: 'value',
      headerName: 'Value',
      width: columnWidths['situation_report.value'],
      cellClassName: (params: GridCellParams<SituationReportRow>): string =>
        params.row.panicPct !== undefined ? 'situation-report-color-bar-cell' : '',
      renderCell: (params: GridRenderCellParams<SituationReportRow>): React.JSX.Element => {
        const { panicPct } = params.row
        if (panicPct !== undefined) {
          const fillPct = Math.max(0, Math.min(100, panicPct))
          const colorPct = fillPct / 100
          return (
            <ColorBar fillPct={fillPct} colorPct={colorPct} linearYellowToRed>
              {params.value}
            </ColorBar>
          )
        }
        return <span>{params.value}</span>
      },
    },
  ]

  return columns
}
