import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { wipeStorage } from '../app/persist'
import { reset } from '../model/gameStateSlice'
import { setResetControlsExpanded } from '../model/settingsSlice'
import { destructiveButtonSx } from '../styling/styleUtils'

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
            <Button variant="contained" onClick={handleResetTurn} sx={destructiveButtonSx}>
              Reset Turn
            </Button>
            <Button variant="contained" onClick={handleResetGame} sx={destructiveButtonSx}>
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
