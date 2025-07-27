import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { missions } from '../collections/missions'
import { MissionCard } from './MissionCard'

export function MissionCards(): React.JSX.Element {
  const investigatedLeadIds = useAppSelector((state) => state.undoable.present.gameState.investigatedLeadIds)
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  // Get mission IDs that have active mission sites
  const activeMissionIds = missionSites.filter((site) => site.state === 'Active').map((site) => site.missionId)

  // Get mission IDs that have successful mission sites
  const successfulMissionIds = new Set(
    missionSites.filter((site) => site.state === 'Successful').map((site) => site.missionId),
  )

  // 🚧KJA mission should be available when a lead for it has been investigated,
  // and the mission hasn't yet been launched. Notably, the same mission may be repeated,
  // by repeating the lead investigation for it.
  //
  // So overall:
  // repeatable lead for mission:
  // - invisible if requirements not met, enabled otherwise
  // repeatable mission:
  // - invisible if lead for it was not investigated
  // - a new enabled instance spawns when lead for it is investigated
  // - given instance becomes disabled when it is launched or expires. The disabled card shows status: expired or mission site result.
  // 🚧KJA the above requires three concepts: mission template, mission instance, and mission site. Rename "missions" to "missionTemplates".

  // Filter out missions that have unmet dependencies
  const discoveredMissions = missions.filter((mission) =>
    mission.dependsOn.every(
      (dependencyId) => investigatedLeadIds.includes(dependencyId) || successfulMissionIds.has(dependencyId),
    ),
  )

  // Sort mission IDs: non-deployed first, then deployed in reverse order (first deployed last)
  const sortedMissionIds = discoveredMissions
    .map((mission) => mission.id)
    .sort((idA, idB) => {
      const aDeployed = activeMissionIds.includes(idA)
      const bDeployed = activeMissionIds.includes(idB)

      if (aDeployed === bDeployed) {
        if (aDeployed) {
          const aIndex = activeMissionIds.indexOf(idA)
          const bIndex = activeMissionIds.indexOf(idB)
          return bIndex - aIndex
        }
        return 0
      }
      return aDeployed ? 1 : -1
    })

  // Group mission IDs into pairs
  const missionIdPairs: string[][] = []
  for (let index = 0; index < sortedMissionIds.length; index += 2) {
    missionIdPairs.push(sortedMissionIds.slice(index, index + 2))
  }

  const maxWidth = '800px'
  return (
    <Card sx={{ maxWidth }}>
      <CardHeader title="Missions" />
      <CardContent sx={{ minWidth: missionIdPairs.length === 0 ? maxWidth : undefined }}>
        <Stack spacing={2}>
          {missionIdPairs.map((pair) => (
            <Grid container spacing={2} columns={2} key={pair.join('-')}>
              {pair.map((missionId) => (
                <Grid size={1} key={missionId}>
                  <MissionCard missionId={missionId} />
                </Grid>
              ))}
              {/* If there was only ever one discovered mission, add an invisible filler grid item 
              to prevent the width of the singular MissionCard from being too small. */}
              {discoveredMissions.length === 1 && <Grid size={1} minWidth={maxWidth} key={'invisible-filler'}></Grid>}
            </Grid>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
