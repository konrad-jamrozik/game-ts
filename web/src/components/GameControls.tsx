import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { advanceTurn } from '../model/gameStateSlice'
import { LabeledValue } from './LabeledValue'
import { ResetControls } from './ResetControls'

export function GameControls(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)

  function handleAdvanceTurn(): void {
    dispatch(advanceTurn())
    dispatch(ActionCreators.clearHistory())
  }

  const labelWidthPx = 110
  return (
    <Card
      sx={{
        width: 330,
      }}
    >
      <CardHeader title="Game Controls" />
      <CardContent>
        <Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* width 156.86 chosen to match exactly the width of "Undo Redo" below. */}
            <Button variant="contained" onClick={handleAdvanceTurn} sx={{ width: 156.86 }}>
              advance turn
            </Button>
            <LabeledValue label="Turn" value={gameState.turn} sx={{ width: labelWidthPx }} />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row">
              <Button
                variant="contained"
                onClick={() => dispatch(ActionCreators.undo())}
                disabled={!useAppSelector((state) => state.undoable.past.length)}
              >
                Undo
              </Button>
              <Button
                variant="contained"
                onClick={() => dispatch(ActionCreators.redo())}
                disabled={!useAppSelector((state) => state.undoable.future.length)}
              >
                Redo
              </Button>
            </Stack>
            <LabeledValue label="Actions" value={gameState.actionsCount} sx={{ width: labelWidthPx }} />
          </Stack>
          <Stack sx={{ paddingTop: 1 }}>
            <ResetControls />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
