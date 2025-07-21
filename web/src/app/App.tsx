import Grid from '@mui/material/Grid'
import { Fragment } from 'react'
import { AgentsDataGrid } from '../components/AgentsDataGrid'
import { AssetsDataGrid } from '../components/AssetsDataGrid'
import { BalanceSheetDataGrid } from '../components/BalanceSheetDataGrid'
import { EventLog } from '../components/EventLog'
import { GameControls } from '../components/GameControls'
import { PlayerActions } from '../components/PlayerActions'
import './App.css'

function App(): React.JSX.Element {
  return (
    <Fragment>
      <Grid container justifyContent={'center'} spacing={2} padding={2} bgcolor={'#30303052'}>
        <Grid>
          <EventLog />
        </Grid>
        <Grid>
          <Grid container spacing={2} direction="column">
            <Grid>
              <GameControls />
            </Grid>
            <Grid>
              <PlayerActions />
            </Grid>
          </Grid>
        </Grid>

        <Grid>
          <AgentsDataGrid />
        </Grid>
        <Grid>
          <Grid container spacing={2} direction="column">
            <Grid>
              <AssetsDataGrid />
            </Grid>
            <Grid>
              <BalanceSheetDataGrid />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  )
}

export default App
