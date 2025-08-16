import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { getActiveMissionSites, sortActiveMissionSites } from '../model/lib/utils/MissionSiteUtils'
import { ExpandableCard } from './ExpandableCard'
import { MissionCard } from './MissionCard'

export function MissionCards(): React.JSX.Element {
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  // Get and sort active mission sites
  const activeMissionSites = getActiveMissionSites(missionSites)
  const sortedActiveMissionSites = sortActiveMissionSites(activeMissionSites)

  const widthVal = '800px'
  return (
    <ExpandableCard title={`Missions (${sortedActiveMissionSites.length})`} sx={{ width: widthVal }}>
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
        {sortedActiveMissionSites.map((site) => (
          <Box key={site.id} sx={{ padding: 1 }}>
            <MissionCard missionSiteId={site.id} />
          </Box>
        ))}
      </Stack>
    </ExpandableCard>
  )
}
