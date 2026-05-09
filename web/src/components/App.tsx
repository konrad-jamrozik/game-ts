import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { Fragment, useEffect } from 'react'
import { runAppInit } from './utils/runAppInit'
import { DebugActionsCard } from './DebugActionsCard'
import { DebugSettingsCard } from './DebugSettingsCard'
import { ErrorToast } from './Error/ErrorToast'
import { EventLog } from './EventLog'
import { GameControls } from './GameControls/GameControls'
import { AIPlayerCard } from './GameControls/AIPlayerCard'
import { UpgradeActions } from './GameControls/UpgradeActions'
import { TurnReportCard } from './TurnReport/TurnReportCard'
import { AssetsCard } from './Assets/AssetsCard'
import { CapacitiesCard } from './Assets/CapacitiesCard'
import { UpgradesCard } from './Assets/UpgradesCard'
import { SituationReportCard } from './SituationReportCard'
import { MissionDetailsScreen } from './MissionDetails/MissionDetailsScreen'
import { ChartsScreen } from './Charts/ChartsScreen'
import { LeadsScreen } from './Leads/LeadsScreen'
import { MissionsScreen } from './Missions/MissionsScreen'
import { AgentsScreen } from './Agents/AgentsScreen'
import { WipeStorage } from './WipeStorage'
import { useAppSelector } from '../redux/hooks'
import type { MissionId } from '../lib/model/modelIds'

function App(): React.JSX.Element {
  const viewMissionDetailsId: MissionId | undefined = useAppSelector((state) => state.selection.viewMissionDetailsId)
  const viewLeads = useAppSelector((state) => state.selection.viewLeads)
  const viewMissions = useAppSelector((state) => state.selection.viewMissions)
  const viewAgents = useAppSelector((state) => state.selection.viewAgents)
  const viewCharts = useAppSelector((state) => state.selection.viewCharts)

  useEffect(() => {
    runAppInit()
  }, [])

  // Check if we're on the wipe route - if so, render WipeStorage component instead
  const pathname = globalThis.location.pathname
  if (pathname.endsWith('/wipe')) {
    return (
      <Fragment>
        <WipeStorage />
        <ErrorToast />
      </Fragment>
    )
  }

  if (viewCharts) {
    return (
      <Fragment>
        <ChartsScreen />
        <ErrorToast />
      </Fragment>
    )
  }

  if (viewLeads) {
    return (
      <Fragment>
        <LeadsScreen />
        <ErrorToast />
      </Fragment>
    )
  }

  if (viewMissions) {
    return (
      <Fragment>
        <MissionsScreen />
        <ErrorToast />
      </Fragment>
    )
  }

  if (viewAgents) {
    return (
      <Fragment>
        <AgentsScreen />
        <ErrorToast />
      </Fragment>
    )
  }

  if (viewMissionDetailsId !== undefined) {
    return (
      <Fragment>
        <MissionDetailsScreen />
        <ErrorToast />
      </Fragment>
    )
  }

  return (
    <Grid
      container
      direction="row"
      spacing={2}
      padding={2}
      paddingX={1}
      bgcolor={'#30303052'}
      flexWrap={'wrap'}
      justifyContent={'center'}
      alignItems="stretch"
    >
      <Grid>
        <Stack spacing={2} alignItems="center">
          <EventLog />
          <DebugActionsCard />
          <DebugSettingsCard />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={2} alignItems="center">
          <GameControls />
          <AIPlayerCard />
          <UpgradeActions />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={2}>
          <AssetsCard />
          <CapacitiesCard />
          <UpgradesCard />
          <SituationReportCard />
          <TurnReportCard />
        </Stack>
      </Grid>
      <ErrorToast />
    </Grid>
  )
}

export default App
