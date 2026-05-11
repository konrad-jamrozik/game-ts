import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch } from '../../redux/hooks'
import { clearViewTurnReport } from '../../redux/slices/selectionSlice'
import { SCREEN_ACTIONS_COLUMN_WIDTH } from '../Common/dataGridLayout'
import { TurnReportCard } from './TurnReportCard'
import { CARD_GAP, SCREEN_PADDING_X, SCREEN_PADDING_Y } from '../styling/spacing'

export function TurnReportScreen(): React.JSX.Element {
  const dispatch = useAppDispatch()

  function handleBackClick(): void {
    dispatch(clearViewTurnReport())
  }

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        dispatch(clearViewTurnReport())
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
        <TurnReportCard />
        <Button variant="contained" onClick={handleBackClick} sx={{ width: SCREEN_ACTIONS_COLUMN_WIDTH }}>
          Back to command center
        </Button>
      </Stack>
    </Box>
  )
}
