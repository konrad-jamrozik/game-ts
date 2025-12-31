import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { LeadCounts } from './leadCounts'

type LeadsDataGridTitleProps = {
  counts: LeadCounts
}

export function LeadsDataGridTitle({ counts }: LeadsDataGridTitleProps): React.JSX.Element {
  return (
    <Box display="flex" justifyContent="space-between" width="100%">
      <Typography variant="h6" component="span">
        Leads: Active {counts.active} {counts.repeatable > 0 && `(Rpt: ${counts.repeatable})`}
      </Typography>
      <Typography variant="h6" component="span">
        Inactive {counts.inactive} | Arch {counts.archived}
      </Typography>
    </Box>
  )
}
