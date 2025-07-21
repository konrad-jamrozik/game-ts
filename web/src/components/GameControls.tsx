import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { advanceTurn, reset } from '../model/gameStateSlice'
import { LabeledValue } from './LabeledValue'

export function GameControls(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.present.gameState)

  function handleAdvanceTurn(): void {
    dispatch(advanceTurn())
    dispatch(ActionCreators.clearHistory())
  }

  function handleResetGame(): void {
    dispatch(reset())
    dispatch(ActionCreators.clearHistory())
  }

  function handleResetTurn(): void {
    // The game state with index 0 is the beginning of the current turn.
    // 🚧KJA turn reset won't work correctly if there were more than 'limit' player actions
    // as defined in store.ts
    dispatch(ActionCreators.jumpToPast(0))
    dispatch(ActionCreators.clearHistory())
  }

  const labelWidthPx = 110
  return (
    <Card
      sx={{
        minWidth: 350,
      }}
    >
      <CardHeader title="Game Controls" />
      <CardContent>
        <Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button variant="contained" onClick={handleAdvanceTurn}>
              advance turn
            </Button>
            <LabeledValue label="Turn" value={gameState.turn} width={labelWidthPx} />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row">
              <Button
                variant="contained"
                onClick={() => dispatch(ActionCreators.undo())}
                disabled={!useAppSelector((state) => state.past.length)}
              >
                Undo
              </Button>
              <Button
                variant="contained"
                onClick={() => dispatch(ActionCreators.redo())}
                disabled={!useAppSelector((state) => state.future.length)}
              >
                Redo
              </Button>
            </Stack>
            <LabeledValue label="Actions" value={gameState.actionsCount} width={labelWidthPx} />
          </Stack>
          <Stack direction="row">
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
        </Stack>
      </CardContent>
    </Card>
  )
}
