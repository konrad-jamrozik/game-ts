import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewFactions } from '../../redux/slices/selectionSlice'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { SCREEN_ACTIONS_COLUMN_WIDTH } from '../Common/dataGridLayout'
import { FactionDetailsDataGrid } from './FactionDetailsDataGrid'
import { CARD_GAP, SCREEN_PADDING_X, SCREEN_PADDING_Y } from '../styling/spacing'

export function FactionsScreen(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { factions, leadInvestigationCounts } = useAppSelector(getCurrentTurnState)
  const revealAllFactionProfiles = useAppSelector((state) => state.settings.revealAllFactionProfiles)

  function handleBackClick(): void {
    dispatch(clearViewFactions())
  }

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        dispatch(clearViewFactions())
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
        <Typography variant="h5">Factions</Typography>
        <FactionDetailsDataGrid
          factions={factions}
          leadInvestigationCounts={leadInvestigationCounts}
          revealAllFactionProfiles={revealAllFactionProfiles}
        />
        <Button variant="contained" onClick={handleBackClick} sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}>
          Back to command center
        </Button>
      </Stack>
    </Box>
  )
}
