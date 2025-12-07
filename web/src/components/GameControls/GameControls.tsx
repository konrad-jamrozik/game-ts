import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { expandAllCards, collapseAllCards } from '../../redux/slices/expansionSlice'
import { LabeledValue } from '../Common/LabeledValue'
import { ExpandableCard } from '../Common/ExpandableCard'
import { LEFT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { ResetControls } from './ResetControls'
import { toF6, f6ge } from '../../lib/primitives/fixed6'

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

  const isGameOver = f6ge(gameState.panic, toF6(1)) || gameState.money < 0 // 100% panic OR negative money

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
              ...(isGameOver && {
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.error.dark,
                  color: theme.palette.error.contrastText,
                },
              }),
            })}
            disabled={isGameOver}
          >
            {isGameOver ? 'game over' : 'next turn'}
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
        <Stack sx={{ paddingTop: 1 }}>
          <ResetControls />
        </Stack>
      </Stack>
    </ExpandableCard>
  )
}
