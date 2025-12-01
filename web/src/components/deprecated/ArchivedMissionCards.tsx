import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import { getArchivedMissionSites, sortMissionSitesByIdDesc } from '../../lib/model_utils/missionSiteUtils'
import { ExpandableCard } from '../Common/ExpandableCard'
import { MissionCard } from './MissionCard'

export function ArchivedMissionCards(): React.JSX.Element {
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  const archivedMissionSites = getArchivedMissionSites(missionSites)
  const sortedArchivedMissionSites = sortMissionSitesByIdDesc(archivedMissionSites)

  const maxWidth = '800px'
  return (
    <ExpandableCard
      title={`Archived Missions (${sortedArchivedMissionSites.length})`}
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
        {sortedArchivedMissionSites.map((site) => (
          <Box key={site.id} sx={{ padding: 1 }}>
            <MissionCard missionSiteId={site.id} />
          </Box>
        ))}
      </Stack>
    </ExpandableCard>
  )
}
