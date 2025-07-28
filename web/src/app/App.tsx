import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
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
            <AssetsDataGrid />
            <BalanceSheetDataGrid />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}

export default App
