import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Fragment } from 'react'
import './App.css'
import GameControls from './GameControls'
import { useGameStateContext } from './GameStateContextProvider'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App(): React.JSX.Element {
  const gs = useGameStateContext()
  const { turn, agents, setAgents, money } = gs

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
          <Button variant="contained" onClick={() => setAgents((prevAgents) => prevAgents + 1)}>
            hire agents
          </Button>
        </Stack>
        {/* Game controls (advance/reset) */}
        <GameControls />
        {/* Game state display */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography id="turn-label" variant="body1">
            Turn
          </Typography>
          <Typography variant="h6" component="span" aria-label="turn" aria-labelledby="turn-label">
            {turn}
          </Typography>

          <Typography id="agents-label" variant="body1">
            Agents
          </Typography>
          <Typography variant="h6" component="span" aria-label="agents" aria-labelledby="agents-label">
            {agents}
          </Typography>

          <Typography id="money-label" variant="body1">
            Money
          </Typography>
          <Typography variant="h6" component="span" aria-label="money" aria-labelledby="money-label">
            {money}
          </Typography>
        </Stack>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </Fragment>
  )
}

export default App
