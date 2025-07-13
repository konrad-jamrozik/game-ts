import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  // Game state
  const [turn, setTurn] = useState(0)
  const [agents, setAgents] = useState(0)
  const [money, setMoney] = useState(100)

  // For demo button (not used in tests)
  const [count, setCount] = useState(0)

  return (
    <>
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
        {/* Demo button, not part of game logic */}
        <Button variant="contained" onClick={() => setCount((cnt) => cnt + 1)}>
          count is {count}
        </Button>

        {/* Game controls */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => setAgents((prevAgents) => prevAgents + 1)}>
            hire agents
          </Button>
          <Button variant="outlined" onClick={() => setTurn((prevTurn) => prevTurn + 1)}>
            advance turn
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setTurn(0)
              setAgents(0)
              setMoney(100)
            }}
          >
            reset game
          </Button>
        </Stack>

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
    </>
  )
}

export default App
