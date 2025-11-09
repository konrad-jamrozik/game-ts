import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { AgentsDataGrid } from '../components/AgentsDataGrid/AgentsDataGrid'
import { ArchivedLeadCards } from '../components/ArchivedLeadCards'
import { ArchivedMissionCards } from '../components/ArchivedMissionCards'
import { EventLog } from '../components/EventLog'
import { GameControls } from '../components/GameControls'
import { LeadCards } from '../components/LeadCards'
import { MissionCards } from '../components/MissionCards'
import { PlayerActions } from '../components/PlayerActions'
import { TurnReportDisplay } from '../components/TurnReport/TurnReportDisplay'
import { AssetsDataGrid } from '../components/AssetsDataGrid'
import { BalanceSheetDataGrid } from '../components/BalanceSheetDataGrid'
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
          <AgentsDataGrid />
          <MissionCards />
          <LeadCards />
          <ArchivedMissionCards />
          <ArchivedLeadCards />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={2}>
          <TurnReportDisplay />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={2}>
          <AssetsDataGrid />
          <BalanceSheetDataGrid />
          <SituationReportCard />
        </Stack>
      </Grid>
    </Grid>
  )
}

export default App
