import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch } from '../../redux/hooks'
import { clearViewLeads } from '../../redux/slices/selectionSlice'
import { AgentsDataGridForLeads2 } from './AgentsDataGridForLeads2'
import { CurrentLeadsDataGrid2 } from './CurrentLeadsDataGrid2'
import { LeadInvestigationActions2 } from './LeadInvestigationActions2'

export function LeadsScreen2(): React.JSX.Element {
  const dispatch = useAppDispatch()

  function handleBackClick(): void {
    dispatch(clearViewLeads())
  }

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
        <Button variant="contained" onClick={handleBackClick}>
          Back to command center
        </Button>
        <CurrentLeadsDataGrid2 />
        <AgentsDataGridForLeads2 />
        <LeadInvestigationActions2 />
      </Stack>
    </Box>
  )
}
