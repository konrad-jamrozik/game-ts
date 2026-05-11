import type { GridCellParams, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import type { FactionId } from '../../lib/model/modelIds'
import { columnWidths } from '../Common/columnWidths'
import { ColorBar } from '../ColorBar/ColorBar'

export type SituationReportNextOperationRow = {
  id: FactionId
  factionId: FactionId
  factionName: string
  nextOperation: string
}

export type SituationReportPanicRow = {
  id: number
  panic: string
  panicPct: number
}

export function getSituationReportNextOperationColumns(): GridColDef<SituationReportNextOperationRow>[] {
  return [
    {
      field: 'factionName',
      headerName: 'Next operation',
      width: columnWidths['situation_report.next_operations.metric'],
    },
    {
      field: 'nextOperation',
      headerName: 'Turns',
      width: columnWidths['situation_report.next_operations.turns'],
    },
  ]
}

export function getSituationReportPanicColumns(): GridColDef<SituationReportPanicRow>[] {
  return [
    {
      field: 'panic',
      headerName: 'Panic',
      width: columnWidths['situation_report.metrics.value'],
      cellClassName: getPanicCellClassName,
      renderCell: getPanicCell,
    },
  ]
}

function getPanicCellClassName(_params: GridCellParams<SituationReportPanicRow>): string {
  return 'situation-report-color-bar-cell'
}

function getPanicCell(params: GridRenderCellParams<SituationReportPanicRow>): React.JSX.Element {
  const fillPct = Math.max(0, Math.min(100, params.row.panicPct))
  const colorPct = fillPct / 100
  return (
    <ColorBar fillPct={fillPct} colorPct={colorPct} linearYellowToRed>
      {params.value}
    </ColorBar>
  )
}
