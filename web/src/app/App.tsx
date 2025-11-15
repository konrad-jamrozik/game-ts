import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { AgentsDataGrid } from '../components/AgentsDataGrid/AgentsDataGrid'
import { EventLog } from '../components/EventLog'
import { GameControls } from '../components/GameControls'
import { LeadInvestigationsDataGrid } from '../components/LeadInvestigationsDataGrid'
import { LeadsDataGrid } from '../components/LeadsDataGrid'
import { MissionsDataGrid } from '../components/MissionsDataGrid'
import { PlayerActions } from '../components/PlayerActions'
import { TurnReportDisplay } from '../components/TurnReport/TurnReportDisplay'
import { AssetsDataGrid } from '../components/AssetsDataGrid'
import { SituationReportCard } from '../components/SituationReportCard'

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
          <AssetsDataGrid />
          <SituationReportCard />
          <TurnReportDisplay />
        </Stack>
      </Grid>
    </Grid>
  )
}

export default App
