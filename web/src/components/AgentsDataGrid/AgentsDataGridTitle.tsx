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
        All {counts.allActive} | Rdy {counts.ready} | Exh {counts.exhausted} | Rcv {counts.recovering}
      </Typography>
      <Typography variant="h6" component="span">
        KIA {counts.kia} | Sck {counts.sacked}
      </Typography>
    </Box>
  )
}
