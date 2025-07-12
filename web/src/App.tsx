import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0),
    [showSuccess, setShowSuccess] = useState(false),
    [agents, setAgents] = useState(0)

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
        <Button variant="contained" onClick={() => setCount((cnt) => cnt + 1)}>
          count is {count}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setAgents((previousAgents) => previousAgents + 1)
            setShowSuccess(true)
          }}
        >
          Add agents
        </Button>
        {showSuccess && <div>success</div>}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography id="agents-label" variant="body1">
            Agents counter
          </Typography>
          <Typography variant="h6" component="span" aria-labelledby="agents-label">
            {agents}
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
