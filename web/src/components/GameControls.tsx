import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useGameStateContext } from '../contexts/GameStateContextProvider'

function GameControls(): React.JSX.Element {
  const { state, dispatch } = useGameStateContext()

  function handleAdvanceTurn(): void {
    dispatch({ type: 'setTurn', payload: state.turn + 1 })
  }

  function handleResetGame(): void {
    dispatch({ type: 'reset' })
  }

  function handleResetTurn(): void {
    dispatch({ type: 'setTurn', payload: 0 })
  }

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button variant="contained" onClick={handleAdvanceTurn}>
        advance turn
      </Button>
      <Button
        variant="contained"
        onClick={handleResetTurn}
        sx={{
          backgroundColor: (theme) => theme.palette.error.dark,
          '&:hover': { backgroundColor: (theme) => theme.palette.error.main },
        }}
      >
        Reset Turn
      </Button>
      <Button
        variant="contained"
        onClick={handleResetGame}
        sx={{
          backgroundColor: (theme) => theme.palette.error.dark,
          '&:hover': { backgroundColor: (theme) => theme.palette.error.main },
        }}
      >
        reset game
      </Button>
    </Stack>
  )
}

export default GameControls
