import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { MissionCard } from './MissionCard'

export function MissionCards(): React.JSX.Element {
  const [expanded, setExpanded] = React.useState(true)
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  function handleExpandClick(): void {
    setExpanded(!expanded)
  }

  // Filter to only show active and deployed mission sites (not archived)
  const activeMissionSites = missionSites.filter((site) => site.state === 'Active' || site.state === 'Deployed')

  // Sort active and deployed mission sites: Active first, then Deployed, within each group by ID (newest first)
  const sortedActiveMissionSites = [...activeMissionSites].sort((siteA, siteB) => {
    // First sort by state: Active missions come before Deployed
    if (siteA.state !== siteB.state) {
      return siteA.state === 'Active' ? -1 : 1
    }
    // Within same state, sort by ID (newest first)
    return siteB.id.localeCompare(siteA.id)
  })

  const widthVal = '800px'
  return (
    <Card sx={{ width: widthVal }}>
      <CardHeader
        avatar={
          <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        title={`Missions (${sortedActiveMissionSites.length})`}
        slotProps={{ title: { variant: 'h5' } }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ padding: 1 }}>
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
        </CardContent>
      </Collapse>
    </Card>
  )
}
