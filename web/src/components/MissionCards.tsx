import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { MissionCard } from './MissionCard'

export function MissionCards(): React.JSX.Element {
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  // Sort mission sites: Active first, then Deployed, then others
  const sortedMissionSites = [...missionSites].sort((siteA, siteB) => {
    const stateOrder = { Active: 0, Deployed: 1, Successful: 2, Failed: 3 }
    const aOrder = stateOrder[siteA.state]
    const bOrder = stateOrder[siteB.state]

    if (aOrder !== bOrder) {
      return aOrder - bOrder
    }

    // Within the same state, sort by ID (newest first)
    return siteB.id.localeCompare(siteA.id)
  })

  // Group mission site IDs into pairs
  const missionSiteIdPairs: string[][] = []
  for (let index = 0; index < sortedMissionSites.length; index += 2) {
    missionSiteIdPairs.push(sortedMissionSites.slice(index, index + 2).map((site) => site.id))
  }

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader title="Missions" />
      <CardContent sx={{ minWidth: missionSiteIdPairs.length === 0 ? maxWidth : undefined }}>
        <Stack spacing={2}>
          {missionSiteIdPairs.map((pair) => (
            <Grid container spacing={2} columns={2} key={pair.join('-')}>
              {pair.map((missionSiteId) => (
                <Grid size={1} key={missionSiteId}>
                  <MissionCard missionSiteId={missionSiteId} />
                </Grid>
              ))}
              {/* If there was only ever one mission site, add an invisible filler grid item 
              to prevent the width of the singular MissionCard from being too small. */}
              {sortedMissionSites.length === 1 && <Grid size={1} minWidth={maxWidth} key={'invisible-filler'}></Grid>}
            </Grid>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
