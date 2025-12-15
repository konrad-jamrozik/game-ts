import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getArchivedMissions, sortMissionsByIdDesc } from '../../lib/model_utils/missionUtils'
import { ExpandableCard } from '../Common/ExpandableCard'
import { MissionCard } from './MissionCard'

export function ArchivedMissionCards(): React.JSX.Element {
  const missions = useAppSelector((state) => state.undoable.present.gameState.missions)

  const archivedMissions = getArchivedMissions(missions)
  const sortedArchivedMissions = sortMissionsByIdDesc(archivedMissions)

  const maxWidth = '800px'
  return (
    <ExpandableCard
      id="deprecated-archived-missions"
      title={`Archived Mission sites (${sortedArchivedMissions.length})`}
      defaultExpanded={false}
      sx={{ maxWidth }}
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
        {sortedArchivedMissions.map((mission) => (
          <Box key={mission.id} sx={{ padding: 1 }}>
            <MissionCard missionSiteId={mission.id} />
          </Box>
        ))}
      </Stack>
    </ExpandableCard>
  )
}
