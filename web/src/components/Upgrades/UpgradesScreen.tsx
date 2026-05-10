import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { isGameLost, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { clearViewUpgrades } from '../../redux/slices/selectionSlice'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { CapacitiesDataGrid } from '../Assets/CapacitiesDataGrid'
import { UpgradesDataGrid } from '../Assets/UpgradesDataGrid'
import { UpgradeActions } from '../GameControls/UpgradeActions'
import { LEADS_SCREEN_BUTTON_WIDTH } from '../Leads/LeadInvestigationActions'

export function UpgradesScreen(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)

  function handleBackClick(): void {
    dispatch(clearViewUpgrades())
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
        dispatch(clearViewUpgrades())
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
        padding: 2,
        paddingX: 1,
        bgcolor: '#30303052',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="center">
        <Stack spacing={2} alignItems="center">
          <CapacitiesDataGrid mode="shop" />
          <UpgradesDataGrid />
        </Stack>
        <Stack spacing={2} alignItems="stretch" sx={{ width: LEADS_SCREEN_BUTTON_WIDTH }}>
          <UpgradeActions />
          <Button
            variant="contained"
            onClick={handleAdvanceTurn}
            disabled={gameEnded}
            sx={{ width: LEADS_SCREEN_BUTTON_WIDTH }}
          >
            {gameLost ? 'Game over' : gameWon ? 'Game won' : 'Next turn'}
          </Button>
          <Button variant="contained" onClick={handleBackClick} sx={{ width: LEADS_SCREEN_BUTTON_WIDTH }}>
            Back to command center
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
