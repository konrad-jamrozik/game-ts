import Typography from '@mui/material/Typography'
import * as React from 'react'
import type { LeadCounts } from './leadCounts'

type LeadsDataGridTitleProps = {
  counts: LeadCounts
}

export function LeadsDataGridTitle({ counts }: LeadsDataGridTitleProps): React.JSX.Element {
  return (
    <Typography variant="h6" component="span">
      Leads: {counts.all}
    </Typography>
  )
}
