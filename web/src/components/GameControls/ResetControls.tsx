import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { wipeStorage } from '../../redux/persist'
import type { RootReducerState } from '../../redux/rootReducer'
import { truncateEventsTo } from '../../redux/slices/eventsSlice'
import { reset } from '../../redux/slices/gameStateSlice'
import { clearAllSelection } from '../../redux/slices/selectionSlice'
import { setResetControlsExpanded } from '../../redux/slices/settingsSlice'
import { log } from '../../lib/primitives/logger'
import { destructiveButtonSx } from '../styling/stylePrimitives'
import { LabeledValue } from '../Common/LabeledValue'
import { useTheme, type SxProps } from '@mui/material/styles'
import { getCurrentTurnState } from '../../redux/storeUtils'

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
  const undoable = useAppSelector((state: RootReducerState) => state.undoable)
  const canUndo = undoable.past.length > 0
  const canRedo = undoable.future.length > 0
  const currentTurn = useAppSelector((state: RootReducerState) => getCurrentTurnState(state).turn)
  const previousEntryTurn = canUndo ? undoable.past.at(-1)?.gameState.turn : undefined
  const nextEntryTurn = canRedo ? undoable.future.at(0)?.gameState.turn : undefined
  const willCrossTurnBoundaryOnNextUndo = canUndo && previousEntryTurn === currentTurn - 1
  const willCrossTurnBoundaryOnNextRedo = canRedo && nextEntryTurn === currentTurn + 1
  const actionsThisTurn = useAppSelector((state: RootReducerState) => getCurrentTurnState(state).actionsCount)

  // Count how many past states are from the current turn
  // This tells us how many undo steps are available within this turn
  const pastStatesForCurrentTurn = undoable.past.filter((s) => s.gameState.turn === currentTurn).length

  // Detect if we're in a compacted state:
  // actionsCount says we did actions, but there are no/fewer past states to undo to
  // This happens after reverting to a turn whose individual actions were compacted
  const isCompactedTurn = actionsThisTurn > 0 && pastStatesForCurrentTurn < actionsThisTurn

  // Can only undo within current turn if we have past states from this turn
  const canUndoWithinTurn = pastStatesForCurrentTurn > 0

  const canResetTurn = actionsThisTurn > 0 && pastStatesForCurrentTurn >= actionsThisTurn

  // Check if we can revert to the previous turn:
  // - Either when no actions in current turn
  // - Or when in a compacted state (can't undo individual actions, so allow reverting)
  const hasPreviousTurnInHistory = undoable.past.some((s) => s.gameState.turn < currentTurn)
  const canRevertToPreviousTurn = (actionsThisTurn === 0 || isCompactedTurn) && hasPreviousTurnInHistory

  // Find the index to jump to for reverting to end of previous turn
  // This finds the last state from the previous turn (the one just before turn advancement)
  const revertToPreviousTurnIndex = canRevertToPreviousTurn
    ? undoable.past.findLastIndex((s) => s.gameState.turn < currentTurn)
    : -1
  const theme = useTheme()
  const labelSx: SxProps = { backgroundColor: theme.palette.background.cardContent }

  function handleResetGame(event?: React.MouseEvent<HTMLButtonElement>): void {
    const useDebug = Boolean(event && (event.ctrlKey || event.metaKey))
    dispatch(reset(useDebug ? { debug: true } : undefined))
    dispatch(clearAllSelection())
    dispatch(ActionCreators.clearHistory())
  }

  function handleUndo(): void {
    dispatch(ActionCreators.undo())
  }

  function handleRedo(): void {
    dispatch(ActionCreators.redo())
  }

  function handleResetTurn(): void {
    if (canResetTurn) {
      log.info('game', `Reset to start of turn ${currentTurn}`)
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

  function handleRevertTurn(): void {
    if (canRevertToPreviousTurn && revertToPreviousTurnIndex >= 0) {
      const previousTurnState = undoable.past[revertToPreviousTurnIndex]
      if (!previousTurnState) {
        return
      }
      const targetTurn = previousTurnState.gameState.turn
      const targetActionsCount = previousTurnState.gameState.actionsCount
      log.info('game', `Revert to end of turn ${targetTurn}`)
      // Jump to the last state of the previous turn
      // jumpToPast takes the index in the past array (0-based from oldest)
      dispatch(ActionCreators.jumpToPast(revertToPreviousTurnIndex))

      // Permanently drop any events that occurred after that point
      dispatch(
        truncateEventsTo({
          turn: targetTurn,
          actionsCount: targetActionsCount,
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
          <Stack direction="row" spacing={2} sx={{ paddingBottom: 1 }} alignItems="center" justifyContent="center">
            <LabeledValue label="Actions" value={actionsThisTurn} sx={labelSx} />
            <Button
              variant="contained"
              onClick={handleUndo}
              disabled={!canUndo || !canUndoWithinTurn}
              sx={willCrossTurnBoundaryOnNextUndo ? destructiveButtonSx : {}}
              title={
                isCompactedTurn
                  ? 'Turn history was compacted. Use "Revert turn" to go back.'
                  : !canUndoWithinTurn
                    ? 'Use "Revert turn" to go back to previous turn'
                    : undefined
              }
            >
              Undo
            </Button>
            <Button
              variant="contained"
              onClick={handleRedo}
              disabled={!canRedo}
              sx={willCrossTurnBoundaryOnNextRedo ? destructiveButtonSx : {}}
            >
              Redo
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ paddingBottom: 1 }} justifyContent="center">
            <Button
              variant="contained"
              onClick={canResetTurn ? handleResetTurn : handleRevertTurn}
              sx={destructiveButtonSx}
              disabled={!canResetTurn && !canRevertToPreviousTurn}
              title={
                canResetTurn
                  ? 'Reset to start of current turn'
                  : isCompactedTurn && canRevertToPreviousTurn
                    ? 'Turn history was compacted. Revert to end of previous turn.'
                    : canRevertToPreviousTurn
                      ? 'Revert to end of previous turn'
                      : isCompactedTurn
                        ? 'Turn history was compacted. No prior state available.'
                        : 'No prior state available' // KJA3 this does not show up over disabled button. Other places have similar issues.
              }
            >
              {canResetTurn ? 'Reset turn' : 'Revert turn'}
            </Button>
            <Button
              variant="contained"
              onClick={handleResetGame}
              sx={destructiveButtonSx}
              title="Ctrl+Click to reset with debug assets"
            >
              Reset game
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="center">
            <Button variant="contained" onClick={handleWipeStorageClick} sx={destructiveButtonSx}>
              Wipe storage and reload
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
