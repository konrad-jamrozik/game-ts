import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { getArchivedMissionSites, sortMissionSitesByIdDesc } from '../model/MissionSiteService'
import { ExpandableCard } from './ExpandableCard'
import { MissionCard } from './MissionCard'

export function ArchivedMissionCards(): React.JSX.Element {
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  const archivedMissionSites = getArchivedMissionSites(missionSites)
  const sortedArchivedMissionSites = sortMissionSitesByIdDesc(archivedMissionSites)

  // Group mission site IDs into pairs
  const missionSiteIdPairs: string[][] = []
  for (let index = 0; index < sortedArchivedMissionSites.length; index += 2) {
    missionSiteIdPairs.push(sortedArchivedMissionSites.slice(index, index + 2).map((site) => site.id))
  }

  const maxWidth = '800px'
  return (
    <ExpandableCard
      title={`Archived Missions (${sortedArchivedMissionSites.length})`}
      defaultExpanded={false}
      sx={{ maxWidth }}
    >
      <Stack spacing={2}>
        {missionSiteIdPairs.map((pair) => (
          <Grid container spacing={2} columns={2} key={pair.join('-')}>
            {pair.map((missionSiteId) => (
              <Grid size={1} key={missionSiteId}>
                <MissionCard missionSiteId={missionSiteId} />
              </Grid>
            ))}
          </Grid>
        ))}
      </Stack>
    </ExpandableCard>
  )
}
