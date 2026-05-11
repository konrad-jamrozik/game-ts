import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { Fragment, useEffect } from 'react'
import { runAppInit } from './utils/runAppInit'
import { ErrorToast } from './Error/ErrorToast'
import { EventLog } from './EventLog'
import { GameControls } from './GameControls/GameControls'
import { OperationsCard } from './Assets/OperationsCard'
import { MissionDetailsScreen } from './MissionDetails/MissionDetailsScreen'
import { ChartsScreen } from './Charts/ChartsScreen'
import { LeadsScreen } from './Leads/LeadsScreen'
import { MissionsScreen } from './Missions/MissionsScreen'
import { AgentsScreen } from './Agents/AgentsScreen'
import { UpgradesScreen } from './Upgrades/UpgradesScreen'
import { TurnReportScreen } from './TurnReport/TurnReportScreen'
import { FactionsScreen } from './Factions/FactionsScreen'
import { WipeStorage } from './WipeStorage'
import { useAppSelector } from '../redux/hooks'
import type { MissionId } from '../lib/model/modelIds'
import { CARD_GAP, SCREEN_PADDING_X, SCREEN_PADDING_Y } from './styling/spacing'

function App(): React.JSX.Element {
  const viewMissionDetailsId: MissionId | undefined = useAppSelector((state) => state.selection.viewMissionDetailsId)
  const viewLeads = useAppSelector((state) => state.selection.viewLeads)
  const viewMissions = useAppSelector((state) => state.selection.viewMissions)
  const viewAgents = useAppSelector((state) => state.selection.viewAgents)
  const viewCharts = useAppSelector((state) => state.selection.viewCharts)
  const viewUpgrades = useAppSelector((state) => state.selection.viewUpgrades)
  const viewTurnReport = useAppSelector((state) => state.selection.viewTurnReport)
  const viewFactions = useAppSelector((state) => state.selection.viewFactions)

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

  if (viewUpgrades) {
    return (
      <Fragment>
        <UpgradesScreen />
        <ErrorToast />
      </Fragment>
    )
  }

  if (viewTurnReport) {
    return (
      <Fragment>
        <TurnReportScreen />
        <ErrorToast />
      </Fragment>
    )
  }

  if (viewFactions) {
    return (
      <Fragment>
        <FactionsScreen />
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
      spacing={CARD_GAP}
      sx={{
        paddingY: SCREEN_PADDING_Y,
        paddingX: SCREEN_PADDING_X,
        bgcolor: '#30303052',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      <Grid>
        <Stack spacing={CARD_GAP} sx={{ alignItems: 'center' }}>
          <GameControls />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={CARD_GAP} sx={{ alignItems: 'center' }}>
          <OperationsCard />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={CARD_GAP} sx={{ alignItems: 'center' }}>
          <EventLog />
        </Stack>
      </Grid>
      <ErrorToast />
    </Grid>
  )
}

export default App
