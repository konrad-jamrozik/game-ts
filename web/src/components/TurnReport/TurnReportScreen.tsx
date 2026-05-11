import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch } from '../../redux/hooks'
import { clearViewTurnReport } from '../../redux/slices/selectionSlice'
import { LEADS_SCREEN_BUTTON_WIDTH } from '../Leads/LeadInvestigationActions'
import { TurnReportCard } from './TurnReportCard'

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
        padding: 2,
        paddingX: 1,
        bgcolor: '#30303052',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <TurnReportCard />
        <Button variant="contained" onClick={handleBackClick} sx={{ width: LEADS_SCREEN_BUTTON_WIDTH }}>
          Back to command center
        </Button>
      </Stack>
    </Box>
  )
}
