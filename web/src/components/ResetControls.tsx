import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import * as React from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch } from '../app/hooks'
import { wipeStorage } from '../app/persist'
import { clearEvents } from '../model/eventsSlice'
import { reset } from '../model/gameStateSlice'
import { Fragment } from 'react'

export function ResetControls(): React.JSX.Element {
  const dispatch = useAppDispatch()

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

  function handleWipeStorageClick(): void {
    wipeStorage()
      .then(() => {
        // Clear events first, then reset the game state
        // This ensures the events middleware can create a "Game reset" event
        dispatch(clearEvents())
        dispatch(reset())
        dispatch(ActionCreators.clearHistory())
      })
      .catch((error: unknown) => {
        console.error('Failed to wipe storage:', error)
      })
  }

  const destructiveButtonSx = {
    backgroundColor: (theme: Theme): string => theme.palette.error.dark,
    '&:hover': { backgroundColor: (theme: Theme): string => theme.palette.error.main },
  }

  return (
    <Fragment>
      <Stack direction="row" sx={{ paddingTop: 2 }} justifyContent="space-between">
        <Button variant="contained" onClick={handleResetTurn} sx={destructiveButtonSx}>
          Reset Turn
        </Button>
        <Button variant="contained" onClick={handleResetGame} sx={destructiveButtonSx}>
          reset game
        </Button>
      </Stack>
      <Stack direction="row" sx={{ paddingTop: 1 }} justifyContent="center">
        <Button variant="contained" onClick={handleWipeStorageClick} sx={destructiveButtonSx}>
          Wipe Storage
        </Button>
      </Stack>
    </Fragment>
  )
}
