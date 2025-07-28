import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import type { MissionSite } from '../model/model'
import { MissionCard } from './MissionCard'

function getArchivedMissionSites(missionSites: MissionSite[]): MissionSite[] {
  // Filter mission sites that are archived (disabled)
  return missionSites.filter(
    (site) => site.state === 'Deployed' || site.state === 'Successful' || site.state === 'Failed',
  )
}

function sortArchivedMissionSites(archivedMissionSites: MissionSite[]): MissionSite[] {
  return [...archivedMissionSites].sort((siteA, siteB) => {
    const stateOrder: Record<string, number> = { Deployed: 0, Successful: 1, Failed: 2 }
    const aOrder = stateOrder[siteA.state] ?? 999
    const bOrder = stateOrder[siteB.state] ?? 999

    if (aOrder !== bOrder) {
      return aOrder - bOrder
    }

    // Within the same state, sort by ID (newest first)
    return siteB.id.localeCompare(siteA.id)
  })
}

export function ArchivedMissionCards(): React.JSX.Element {
  const [expanded, setExpanded] = React.useState(false)
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  function handleExpandClick(): void {
    setExpanded(!expanded)
  }

  const archivedMissionSites = getArchivedMissionSites(missionSites)

  const sortedArchivedMissionSites = sortArchivedMissionSites(archivedMissionSites)

  // Group mission site IDs into pairs
  const missionSiteIdPairs: string[][] = []
  for (let index = 0; index < sortedArchivedMissionSites.length; index += 2) {
    missionSiteIdPairs.push(sortedArchivedMissionSites.slice(index, index + 2).map((site) => site.id))
  }

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader
        sx={{ minWidth: missionSiteIdPairs.length === 0 || !expanded ? maxWidth : undefined }}
        title="Archived Missions"
        action={
          <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack spacing={2}>
            {missionSiteIdPairs.map((pair) => (
              <Grid container spacing={2} columns={2} key={pair.join('-')}>
                {pair.map((missionSiteId) => (
                  <Grid size={1} key={missionSiteId}>
                    <MissionCard missionSiteId={missionSiteId} />
                  </Grid>
                ))}
                {/* If there was only ever one archived mission site, add an invisible filler grid item 
                to prevent the width of the singular MissionCard from being too small. */}
                {sortedArchivedMissionSites.length === 1 && (
                  <Grid size={1} minWidth={maxWidth} key={'invisible-filler'}></Grid>
                )}
              </Grid>
            ))}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  )
}
