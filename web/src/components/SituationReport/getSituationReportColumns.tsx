import type { GridColDef } from '@mui/x-data-grid'
import { columnWidths } from '../Common/columnWidths'

export type SituationReportRow = {
  id: number
  metric: string
  value: string
  diff?: string
  reverseColor?: boolean
}

export function getSituationReportColumns(): GridColDef<SituationReportRow>[] {
  const columns: GridColDef<SituationReportRow>[] = [
    { field: 'metric', headerName: 'Metric', width: columnWidths['situation_report.metric'] },
    { field: 'value', headerName: 'Value', width: columnWidths['situation_report.value'] },
  ]

  return columns
}
