import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { MissionCounts } from './missionCounts'

type MissionsDataGridTitleProps = {
  counts: MissionCounts
}

export function MissionsDataGridTitle({ counts }: MissionsDataGridTitleProps): React.JSX.Element {
  return (
    <Box display="flex" justifyContent="space-between" width="100%">
      <Typography variant="h6" component="span">
        Missions: Active {counts.active}
      </Typography>
      <Typography variant="h6" component="span">
        Exp {counts.expired} | Succ {counts.successful} | Fail {counts.failed}
      </Typography>
    </Box>
  )
}
