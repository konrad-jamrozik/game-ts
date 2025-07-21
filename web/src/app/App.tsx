import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Fragment } from 'react'
import { GameControls } from '../components/GameControls'
import { GameStateDisplay } from '../components/GameStateDisplay'
import { PlayerActions } from '../components/PlayerActions'
import './App.css'

function App(): React.JSX.Element {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  return (
    <Fragment>
      <Grid container justifyContent={'center'} spacing={2} padding={2} bgcolor={'#30303052'}>
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
          <GameStateDisplay />
        </Grid>
      </Grid>
      <div>prefersDarkMode: {prefersDarkMode.toString()}</div>
    </Fragment>
  )
}

export default App
