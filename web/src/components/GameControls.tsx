import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useGameStateContext } from '../contexts/GameStateContextProvider'

function GameControls(): React.JSX.Element {
  const { setTurn, setAgents, setMoney } = useGameStateContext()

  function handleAdvanceTurn(): void {
    setTurn((prevTurn) => prevTurn + 1)
  }

  function handleResetGame(): void {
    setTurn(0)
    setAgents(0)
    setMoney(100)
  }

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button variant="contained" onClick={handleAdvanceTurn}>
        advance turn
      </Button>
      <Button variant="contained" color="error" onClick={handleResetGame}>
        reset game
      </Button>
    </Stack>
  )
}

export default GameControls
