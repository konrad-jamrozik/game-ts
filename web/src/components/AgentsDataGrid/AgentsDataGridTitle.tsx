import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { AgentCounts } from './agentCounts'

type AgentsDataGridTitleProps = {
  counts: AgentCounts
}

export function AgentsDataGridTitle({ counts }: AgentsDataGridTitleProps): React.JSX.Element {
  return (
    <Box display="flex" justifyContent="space-between" width="100%">
      <Typography variant="h6" component="span">
        A: {counts.allActive} / R: {counts.ready} / E: {counts.exhausted}
      </Typography>
      <Typography variant="h6" component="span">
        KIA: {counts.kia} / S: {counts.sacked}
      </Typography>
    </Box>
  )
}
