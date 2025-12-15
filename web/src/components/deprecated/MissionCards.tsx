import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getActiveOrDeployedMissions, sortActiveOrDeployedMissions } from '../../lib/model_utils/missionUtils'
import { ExpandableCard } from '../Common/ExpandableCard'
import { MissionCard } from './MissionCard'

export function MissionCards(): React.JSX.Element {
  const missions = useAppSelector((state) => state.undoable.present.gameState.missions)

  // Get and sort active missions
  const activeMissions = getActiveOrDeployedMissions(missions)
  const sortedActiveMissions = sortActiveOrDeployedMissions(activeMissions)

  const widthVal = '800px'
  return (
    <ExpandableCard
      id="deprecated-missions"
      title={`Mission sites (${sortedActiveMissions.length})`}
      sx={{ width: widthVal }}
    >
      <Stack
        direction="row"
        spacing={0}
        sx={{
          flexWrap: 'wrap',
          '& > *': {
            flexBasis: 'calc(50%)',
          },
        }}
      >
        {sortedActiveMissions.map((mission) => (
          <Box key={mission.id} sx={{ padding: 1 }}>
            <MissionCard missionSiteId={mission.id} />
          </Box>
        ))}
      </Stack>
    </ExpandableCard>
  )
}
