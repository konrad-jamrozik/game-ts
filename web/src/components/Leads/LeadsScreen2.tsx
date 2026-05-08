import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { isGameLost, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { advanceTurn } from '../../redux/slices/gameStateSlice'
import { clearViewLeads } from '../../redux/slices/selectionSlice'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { CURRENT_LEADS_DATA_GRID_WIDTH } from '../Common/widthConstants'
import { AgentsDataGridForLeads2 } from './AgentsDataGridForLeads2'
import { CurrentLeadsDataGrid2 } from './CurrentLeadsDataGrid2'
import { LeadInvestigationActions2 } from './LeadInvestigationActions2'

export function LeadsScreen2(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)

  function handleBackClick(): void {
    dispatch(clearViewLeads())
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
        dispatch(clearViewLeads())
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
      <Stack spacing={2} alignItems="center">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ width: CURRENT_LEADS_DATA_GRID_WIDTH }}
        >
          <LeadInvestigationActions2 />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleAdvanceTurn} disabled={gameEnded}>
              {gameLost ? 'Game over' : gameWon ? 'Game won' : 'Next turn'}
            </Button>
            <Button variant="contained" onClick={handleBackClick}>
              Back to command center
            </Button>
          </Stack>
        </Stack>
        <CurrentLeadsDataGrid2 />
        <AgentsDataGridForLeads2 />
      </Stack>
    </Box>
  )
}
