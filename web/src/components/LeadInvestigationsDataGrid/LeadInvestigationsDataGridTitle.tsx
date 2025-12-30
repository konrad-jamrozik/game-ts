import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { LeadInvestigationCounts } from './leadInvestigationCounts'

type LeadInvestigationsDataGridTitleProps = {
  counts: LeadInvestigationCounts
}

export function LeadInvestigationsDataGridTitle({
  counts,
}: LeadInvestigationsDataGridTitleProps): React.JSX.Element {
  return (
    <Box display="flex" justifyContent="space-between" width="100%">
      <Typography variant="h6" component="span">
        Act: {counts.active}
      </Typography>
      <Typography variant="h6" component="span">
        Done: {counts.done}
      </Typography>
    </Box>
  )
}
