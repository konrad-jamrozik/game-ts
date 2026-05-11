import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
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
  setViewFactions,
  setViewTurnReport,
  setViewUpgrades,
} from '../../redux/slices/selectionSlice'
import { LabeledValue } from '../Common/LabeledValue'
import { ExpandableCard } from '../Common/ExpandableCard'
import { CONTROLS_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { AIPlayerSection } from './AIPlayerCard'
import { DebugActions } from './DebugActions'
import { DebugSettings } from './DebugSettings'
import { ResetControls } from './ResetControls'
import { isGameLost, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { CONTROL_ROW_GAP, SECTION_GAP } from '../styling/spacing'

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

  function handleTurnReport(): void {
    dispatch(setViewTurnReport())
  }

  function handleFactions(): void {
    dispatch(setViewFactions())
  }

  const gameLost = isGameLost(gameState)
  const gameWon = isGameWon(gameState)
  const gameEnded = gameLost || gameWon

  return (
    <ExpandableCard
      id="game-controls"
      title="Game Controls"
      defaultExpanded={true}
      sx={{ width: CONTROLS_COLUMN_CARD_WIDTH }}
    >
      <Stack>
        <ControlButtonRow>
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
            fullWidth
          >
            {gameLost ? 'Game over' : gameWon ? 'Game won' : 'Next turn'}
          </Button>
          <LabeledValue label="Turn" value={gameState.turn} sx={{ width: '100%' }} />
        </ControlButtonRow>
        <ControlButtonRow>
          <Button variant="contained" onClick={handleExpandAll} fullWidth>
            Expand
          </Button>
          <Button variant="contained" onClick={handleCollapseAll} fullWidth>
            Collapse
          </Button>
        </ControlButtonRow>
        <Stack spacing={CONTROL_ROW_GAP}>
          <ControlButtonRow>
            <Button variant="contained" onClick={handleAgents} fullWidth>
              Agents
            </Button>
            <Button variant="contained" onClick={handleMissions} fullWidth>
              Missions
            </Button>
          </ControlButtonRow>
          <ControlButtonRow>
            <Button variant="contained" onClick={handleLeads} fullWidth>
              Leads
            </Button>
            <Button variant="contained" onClick={handleCharts} fullWidth>
              Charts
            </Button>
          </ControlButtonRow>
          <ControlButtonRow>
            <Button variant="contained" onClick={handleUpgrades} fullWidth>
              Upgrades
            </Button>
            <Button variant="contained" onClick={handleTurnReport} fullWidth>
              Turn Report
            </Button>
          </ControlButtonRow>
          <ControlButtonRow>
            <Button variant="contained" onClick={handleFactions} fullWidth>
              Factions
            </Button>
            <span />
          </ControlButtonRow>
        </Stack>
        <Stack sx={{ paddingTop: SECTION_GAP }}>
          <ResetControls />
        </Stack>
        <Stack sx={{ paddingTop: SECTION_GAP }}>
          <AIPlayerSection />
        </Stack>
        <Stack sx={{ paddingTop: SECTION_GAP }}>
          <DebugActions />
        </Stack>
        <Stack sx={{ paddingTop: SECTION_GAP }}>
          <DebugSettings />
        </Stack>
      </Stack>
    </ExpandableCard>
  )
}

function ControlButtonRow({ children, sx }: ControlButtonRowProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        columnGap: CONTROL_ROW_GAP,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

type ControlButtonRowProps = {
  children: React.ReactNode
  sx?: object
}
