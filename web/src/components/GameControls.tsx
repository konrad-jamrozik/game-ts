import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { reset, setTurn } from '../model/gameStateSlice'

export function GameControls(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const turn = useAppSelector((state) => state.present.gameState.turn)

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
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2}>
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
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          onClick={() => dispatch(ActionCreators.undo())}
          disabled={!useAppSelector((state) => state.past.length)}
        >
          Undo
        </Button>
        <Button
          variant="outlined"
          onClick={() => dispatch(ActionCreators.redo())}
          disabled={!useAppSelector((state) => state.future.length)}
        >
          Redo
        </Button>
      </Stack>
    </Stack>
  )
}
