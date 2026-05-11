import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { isGameLost, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { clearViewMissions } from '../../redux/slices/selectionSlice'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { MissionsDataGrid } from '../MissionsDataGrid/MissionsDataGrid'
import { AgentsDataGridForMissions } from './AgentsDataGridForMissions'
import { MissionDeploymentActions } from './MissionDeploymentActions'
import { SCREEN_ACTIONS_COLUMN_WIDTH } from '../Common/dataGridLayout'
import { CARD_GAP, SCREEN_PADDING_X, SCREEN_PADDING_Y, SECTION_GAP } from '../styling/spacing'

export function MissionsScreen(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)

  function handleBackClick(): void {
    dispatch(clearViewMissions())
  }

  function handleAdvanceTurn(): void {
    dispatch(advanceTurn())
  }

  const gameLost = isGameLost(gameState)
  const gameWon = isGameWon(gameState)
  const gameEnded = gameLost || gameWon

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        dispatch(clearViewMissions())
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)
    return (): void => {
      globalThis.removeEventListener('keydown', handleKeyDown)
    }
  }, [dispatch])

  return (
    <Box
      sx={{
        paddingY: SCREEN_PADDING_Y,
        paddingX: SCREEN_PADDING_X,
        bgcolor: '#30303052',
      }}
    >
      <Stack spacing={CARD_GAP} alignItems="center">
        <MissionsDataGrid />
        <Stack direction="row" spacing={CARD_GAP} alignItems="flex-start" justifyContent="center">
          <Stack spacing={SECTION_GAP} alignItems="stretch" sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}>
            <MissionDeploymentActions />
            <Button
              variant="contained"
              onClick={handleAdvanceTurn}
              disabled={gameEnded}
              sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}
            >
              {gameLost ? 'Game over' : gameWon ? 'Game won' : 'Next turn'}
            </Button>
            <Button variant="contained" onClick={handleBackClick} sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}>
              Back to command center
            </Button>
          </Stack>
          <AgentsDataGridForMissions />
        </Stack>
      </Stack>
    </Box>
  )
}
