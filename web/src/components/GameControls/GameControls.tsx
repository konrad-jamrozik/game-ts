import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { expandAllCards, collapseAllCards } from '../../redux/slices/expansionSlice'
import {
  setViewAgents,
  setViewCharts,
  setViewLeads,
  setViewMissions,
  setViewUpgrades,
} from '../../redux/slices/selectionSlice'
import { LabeledValue } from '../Common/LabeledValue'
import { ExpandableCard } from '../Common/ExpandableCard'
import { CONTROLS_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { DebugActions } from './DebugActions'
import { DebugSettings } from './DebugSettings'
import { ResetControls } from './ResetControls'
import { isGameLost, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { getCurrentTurnState } from '../../redux/storeUtils'

export function GameControls(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)

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

  function handleAgents(): void {
    dispatch(setViewAgents())
  }

  function handleMissions(): void {
    dispatch(setViewMissions())
  }

  function handleLeads(): void {
    dispatch(setViewLeads())
  }

  function handleUpgrades(): void {
    dispatch(setViewUpgrades())
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
      sx={{ width: CONTROLS_COLUMN_CARD_WIDTH }}
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
            {gameLost ? 'Game over' : gameWon ? 'Game won' : 'Next turn'}
          </Button>
          <LabeledValue label="Turn" value={gameState.turn} sx={{ width: labelWidthPx }} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ paddingTop: 1 }}>
          <Button variant="contained" onClick={handleExpandAll} fullWidth>
            Expand
          </Button>
          <Button variant="contained" onClick={handleCollapseAll} fullWidth>
            Collapse
          </Button>
        </Stack>
        <Stack spacing={2} sx={{ paddingTop: 1 }}>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleAgents} fullWidth>
              Agents
            </Button>
            <Button variant="contained" onClick={handleMissions} fullWidth>
              Missions
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleLeads} fullWidth>
              Leads
            </Button>
            <Button variant="contained" onClick={handleCharts} fullWidth>
              Charts
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleUpgrades} fullWidth>
              Upgrades
            </Button>
          </Stack>
        </Stack>
        <Stack sx={{ paddingTop: 1 }}>
          <ResetControls />
        </Stack>
        <Stack sx={{ paddingTop: 1 }}>
          <DebugActions />
        </Stack>
        <Stack sx={{ paddingTop: 1 }}>
          <DebugSettings />
        </Stack>
      </Stack>
    </ExpandableCard>
  )
}
