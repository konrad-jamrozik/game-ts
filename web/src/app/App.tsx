import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { AgentsDataGrid } from '../components/AgentsDataGrid'
import { ArchivedLeadCards } from '../components/ArchivedLeadCards'
import { ArchivedMissionCards } from '../components/ArchivedMissionCards'
import { AssetsDataGrid } from '../components/AssetsDataGrid'
import { BalanceSheetDataGrid } from '../components/BalanceSheetDataGrid'
import { EventLog } from '../components/EventLog'
import { GameControls } from '../components/GameControls'
import { LeadCards } from '../components/LeadCards'
import { MissionCards } from '../components/MissionCards'
import { PlayerActions } from '../components/PlayerActions'

function App(): React.JSX.Element {
  return (
    <Container maxWidth={false} sx={{ padding: 0 }}>
      <Grid
        container
        direction="row"
        justifyContent={'center'}
        spacing={2}
        padding={2}
        bgcolor={'#30303052'}
        flexWrap={'wrap'}
      >
        <Grid>
          <Grid container spacing={2} direction="column" alignItems="center">
            <Grid>
              <GameControls />
            </Grid>
            <Grid>
              <PlayerActions />
            </Grid>
            <Grid alignSelf={'stretch'}>
              <EventLog />
            </Grid>
          </Grid>
        </Grid>
        <Grid>
          <Grid container spacing={2} direction="column" alignItems="center">
            <Grid>
              <AgentsDataGrid />
            </Grid>
            <Grid>
              <MissionCards />
            </Grid>
            <Grid>
              <LeadCards />
            </Grid>
            <Grid>
              <ArchivedMissionCards />
            </Grid>
            <Grid>
              <ArchivedLeadCards />
            </Grid>
          </Grid>
        </Grid>
        <Grid>
          <Grid container spacing={2} direction="column" alignItems="center">
            <Grid>
              <AssetsDataGrid />
            </Grid>
            <Grid>
              <BalanceSheetDataGrid />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

export default App
