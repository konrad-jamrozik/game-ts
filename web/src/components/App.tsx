import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { AgentsDataGrid } from './AgentsDataGrid/AgentsDataGrid'
import { DebugCard } from './DebugCard'
import { ErrorToast } from './Error/ErrorToast'
import { EventLog } from './EventLog'
import { GameControls } from './GameControls/GameControls'
import { LeadInvestigationsDataGrid } from './LeadInvestigationsDataGrid/LeadInvestigationsDataGrid'
import { LeadsDataGrid } from './LeadsDataGrid/LeadsDataGrid'
import { MissionsDataGrid } from './MissionsDataGrid/MissionsDataGrid'
import { PlayerActions } from './GameControls/PlayerActions'
import { TurnReportDisplay } from './TurnReport/TurnReportDisplay'
import { AssetsAndCapabCard } from './Assets/AssetsAndCapabCard'
import { SituationReportCard } from './SituationReportCard'

function App(): React.JSX.Element {
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
          <AssetsAndCapabCard />
          <SituationReportCard />
          <TurnReportDisplay />
        </Stack>
      </Grid>
      <ErrorToast />
    </Grid>
  )
}

export default App
