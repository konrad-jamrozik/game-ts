import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Fragment } from 'react'
import reactLogo from '../assets/react.svg'
import { useGameStateContext } from '../contexts/GameStateContextProvider'
import './App.css'
import GameControls from './GameControls'
import { GameStateDisplay } from './GameStateDisplay'
import viteLogo from '/vite.svg'

function App(): React.JSX.Element {
  const { state, dispatch } = useGameStateContext()

  return (
    <Fragment>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer noopener">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer noopener">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {/* Game controls */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => dispatch({ type: 'setAgents', payload: state.agents + 1 })}>
            hire agents
          </Button>
        </Stack>
        {/* Game controls (advance/reset) */}
        <GameControls />
        {/* Game state display */}
        <GameStateDisplay />

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </Fragment>
  )
}

export default App
