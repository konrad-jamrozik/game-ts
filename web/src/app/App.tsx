import Grid from '@mui/material/Grid'
import { Fragment } from 'react'
import { GameControls } from '../components/GameControls'
import { GameStateDisplay } from '../components/GameStateDisplay'
import { PlayerActions } from '../components/PlayerActions'
import './App.css'

function App(): React.JSX.Element {
  return (
    <Fragment>
      <div className="card">
        <Grid container spacing={2}>
          <Grid size={6}>
            <Grid container spacing={2} direction="column">
              <Grid>
                <GameControls />
              </Grid>
              <Grid>
                <PlayerActions />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={6}>
            <GameStateDisplay />
          </Grid>
        </Grid>
      </div>
    </Fragment>
  )
}

export default App
