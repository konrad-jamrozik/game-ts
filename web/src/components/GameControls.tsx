import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { reset, setTurn } from '../model/gameStateSlice'

export function GameControls(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const turn = useAppSelector((state) => state.gameState.turn)

  function handleAdvanceTurn(): void {
    dispatch(setTurn(turn + 1))
  }

  function handleResetGame(): void {
    dispatch(reset())
  }

  function handleResetTurn(): void {
    dispatch(setTurn(0))
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
