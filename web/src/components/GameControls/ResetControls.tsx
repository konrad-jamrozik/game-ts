import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { wipeStorage } from '../../app/persist'
import type { RootState } from '../../app/store'
import { truncateEventsTo } from '../../lib/slices/eventsSlice'
import { reset } from '../../lib/slices/gameStateSlice'
import { clearAllSelection } from '../../lib/slices/selectionSlice'
import { setResetControlsExpanded } from '../../lib/slices/settingsSlice'
import { destructiveButtonSx } from '../../styling/styleUtils'

function handleWipeStorageClick(): void {
  wipeStorage()
    .then(() => {
      // Reload the page to let initialization logic handle empty storage
      globalThis.location.reload()
    })
    .catch((error: unknown) => {
      console.error('Failed to wipe storage:', error)
    })
}

export function ResetControls(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const expanded = useAppSelector((state) => state.settings.areResetControlsExpanded)
  const actionsThisTurn = useAppSelector((state: RootState) => state.undoable.present.gameState.actionsCount)
  const currentTurn = useAppSelector((state: RootState) => state.undoable.present.gameState.turn)
  const availableUndoSteps = useAppSelector((state: RootState) => state.undoable.past.length)
  const canResetTurn = actionsThisTurn > 0 && availableUndoSteps >= actionsThisTurn

  function handleResetGame(event?: React.MouseEvent<HTMLButtonElement>): void {
    const useDebug = Boolean(event && (event.ctrlKey || event.metaKey))
    dispatch(reset(useDebug ? { debug: true } : undefined))
    dispatch(clearAllSelection())
    dispatch(ActionCreators.clearHistory())
  }

  function handleResetTurn(): void {
    if (canResetTurn) {
      // Move state back to the start of the current turn
      dispatch(ActionCreators.jump(-actionsThisTurn))

      // Permanently drop any events that occurred after the start-of-turn pointer
      dispatch(
        truncateEventsTo({
          turn: currentTurn,
          actionsCount: 0,
        }),
      )
    }
  }

  function handleAccordionChange(_event: React.SyntheticEvent, isExpanded: boolean): void {
    dispatch(setResetControlsExpanded(isExpanded))
  }

  // The disableGutters in Accordion prevents the heading text from slightly moving down vertically
  // https://stackoverflow.com/questions/66816785/how-to-remove-accordion-gap-when-expanded
  return (
    <Accordion expanded={expanded} onChange={handleAccordionChange} disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="reset-controls-content"
        id="reset-controls-header"
      >
        <Typography component="span">Reset controls</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack>
          <Stack direction="row" sx={{ paddingBottom: 1 }} justifyContent="space-between">
            <Button
              variant="contained"
              onClick={handleResetTurn}
              sx={destructiveButtonSx}
              disabled={!canResetTurn}
              title={!canResetTurn ? 'No prior state at start of this turn' : undefined}
            >
              Reset Turn
            </Button>
            <Button
              variant="contained"
              onClick={handleResetGame}
              sx={destructiveButtonSx}
              title="Ctrl+Click to reset with debug assets"
            >
              reset game
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="center">
            <Button variant="contained" onClick={handleWipeStorageClick} sx={destructiveButtonSx}>
              Wipe Storage & Reload
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
