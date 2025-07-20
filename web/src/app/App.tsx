// ...existing code...
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Fragment } from 'react'
import { useAppDispatch } from '../app/hooks'
import { GameControls } from '../components/GameControls'
import { GameStateDisplay } from '../components/GameStateDisplay'
import { hireAgent } from '../model/gameStateSlice'
import './App.css'

function App(): React.JSX.Element {
  const dispatch = useAppDispatch()

  return (
    <Fragment>
      <div className="card">
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => dispatch(hireAgent())}>
            hire agent
          </Button>
        </Stack>
        <GameControls />
        <GameStateDisplay />
      </div>
    </Fragment>
  )
}

export default App
