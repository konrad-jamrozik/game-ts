import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { Fragment, useEffect } from 'react'
import { runAppInit } from './utils/appInitChecks'
import { AgentsDataGrid } from './AgentsDataGrid/AgentsDataGrid'
import { DebugCard } from './DebugCard'
import { ErrorToast } from './Error/ErrorToast'
import { EventLog } from './EventLog'
import { GameControls } from './GameControls/GameControls'
import { AIPlayerSection } from './GameControls/AIPlayerSection'
import { LeadInvestigationsDataGrid } from './LeadInvestigationsDataGrid/LeadInvestigationsDataGrid'
import { LeadsDataGrid } from './LeadsDataGrid/LeadsDataGrid'
import { MissionsDataGrid } from './MissionsDataGrid/MissionsDataGrid'
import { PlayerActions } from './GameControls/PlayerActions'
import { TurnReportCard } from './TurnReport/TurnReportCard'
import { AssetsCard } from './Assets/AssetsCard'
import { CapacitiesCard } from './Assets/CapacitiesCard'
import { UpgradesCard } from './Assets/UpgradesCard'
import { SituationReportCard } from './SituationReportCard'
import { MissionDetailsScreen } from './MissionDetails/MissionDetailsScreen'
import { ChartsScreen } from './Charts/ChartsScreen'
import { useAppSelector } from '../redux/hooks'
import type { MissionId } from '../lib/model/modelIds'

function App(): React.JSX.Element {
  const viewMissionDetailsId: MissionId | undefined = useAppSelector((state) => state.selection.viewMissionDetailsId)
  const viewCharts = useAppSelector((state) => state.selection.viewCharts)

  useEffect(() => {
    runAppInit()
  }, [])

  if (viewCharts) {
    return (
      <Fragment>
        <ChartsScreen />
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
          <GameControls />
          <AIPlayerSection />
          <PlayerActions />
          <EventLog />
          <DebugCard />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={2}>
          <MissionsDataGrid />
          <LeadsDataGrid />
          <LeadInvestigationsDataGrid />
          <AgentsDataGrid />
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
