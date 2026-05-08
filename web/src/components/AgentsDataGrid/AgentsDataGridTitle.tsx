import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import type { AgentCounts, AgentsForLeadsGridTitleCounts } from './agentCounts'

type AgentsDataGridTitleProps =
  | { variant: 'commandCenter'; counts: AgentCounts }
  | { variant: 'leads'; counts: AgentsForLeadsGridTitleCounts }

export function AgentsDataGridTitle(props: AgentsDataGridTitleProps): React.JSX.Element {
  if (props.variant === 'leads') {
    const { counts } = props
    return (
      <Box display="flex" justifyContent="flex-start" width="100%">
        <Typography variant="h6" component="span">
          Agents: {counts.allActive}
        </Typography>
      </Box>
    )
  }

  const { counts } = props
  return (
    <Box display="flex" justifyContent="space-between" width="100%">
      <Typography variant="h6" component="span">
        Agents: All {counts.allActive} | Rdy {counts.ready} | Exh {counts.exhausted} | Rcv {counts.recovering}
      </Typography>
      <Typography variant="h6" component="span">
        KIA {counts.kia} | Sck {counts.sacked}
      </Typography>
    </Box>
  )
}
