import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { expandAllCards, collapseAllCards } from '../../redux/slices/expansionSlice'
import { setViewCharts } from '../../redux/slices/selectionSlice'
import { log } from '../../lib/primitives/logger'
import { LabeledValue } from '../Common/LabeledValue'
import { ExpandableCard } from '../Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { ResetControls } from './ResetControls'
import { isGameLost, isGameWon } from '../../lib/game_utils/gameStateChecks'

export function GameControls(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.undoable.present.gameState)

  function handleAdvanceTurn(): void {
    dispatch(advanceTurn())
  }

  function handleExpandAll(): void {
    dispatch(expandAllCards())
  }

  function handleCollapseAll(): void {
    dispatch(collapseAllCards())
  }

  function handleCharts(): void {
    dispatch(setViewCharts())
  }

  const gameLost = isGameLost(gameState)
  const gameWon = isGameWon(gameState)
  const gameEnded = gameLost || gameWon

  const labelWidthPx = 110
  return (
    <ExpandableCard
      id="game-controls"
      title="Game Controls"
      defaultExpanded={true}
      sx={{ width: LEFT_COLUMN_CARD_WIDTH }}
    >
      <Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            variant="contained"
            onClick={handleAdvanceTurn}
            sx={(theme) => ({
              ...(gameLost && {
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.error.dark,
                  color: theme.palette.error.contrastText,
                },
              }),
              ...(gameWon && {
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.success.dark,
                  color: theme.palette.success.contrastText,
                },
              }),
            })}
            disabled={gameEnded}
          >
            {gameLost ? 'game over' : gameWon ? 'Game won' : 'next turn'}
          </Button>
          <LabeledValue label="Turn" value={gameState.turn} sx={{ width: labelWidthPx }} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ paddingTop: 1 }}>
          <Button variant="contained" onClick={handleExpandAll} fullWidth>
            Expand all
          </Button>
          <Button variant="contained" onClick={handleCollapseAll} fullWidth>
            Collapse all
          </Button>
        </Stack>
        <Stack sx={{ paddingTop: 1, alignItems: 'center' }}>
          <Button variant="contained" onClick={handleCharts} sx={{ width: '60%' }}>
            Charts
          </Button>
        </Stack>
        <Stack sx={{ paddingTop: 1 }}>
          <ResetControls />
        </Stack>
      </Stack>
    </ExpandableCard>
  )
}
