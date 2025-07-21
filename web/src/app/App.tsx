import Grid from '@mui/material/Grid'
import { Fragment } from 'react'
import { AssetsDataGrid } from '../components/AssetsDataGrid'
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
          <AssetsDataGrid />
        </Grid>
      </Grid>
    </Fragment>
  )
}

export default App
