import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewMissionDetails } from '../../redux/slices/selectionSlice'
import { MissionDetailsCard } from './MissionDetailsCard'
import { CombatLogCard } from './CombatLogCard'
import { BattleLogCard } from './BattleLogCard'
import { CARD_GAP, SCREEN_PADDING_X, SCREEN_PADDING_Y } from '../styling/spacing'

export function MissionDetailsScreen(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const viewMissionDetailsId = useAppSelector((state) => state.selection.viewMissionDetailsId)

  function handleBackClick(): void {
    dispatch(clearViewMissionDetails())
  }

  React.useEffect(() => {
    if (viewMissionDetailsId === undefined) {
      return (): void => {
        // no-op cleanup when no mission is selected
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        dispatch(clearViewMissionDetails())
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)

    return (): void => {
      globalThis.removeEventListener('keydown', handleKeyDown)
    }
  }, [viewMissionDetailsId, dispatch])

  if (viewMissionDetailsId === undefined) {
    return <div>No mission selected</div>
  }

  return (
    <Box>
      <Grid
        container
        direction="row"
        spacing={CARD_GAP}
        paddingY={SCREEN_PADDING_Y}
        paddingX={SCREEN_PADDING_X}
        bgcolor={'#30303052'}
        flexWrap={'wrap'}
        justifyContent={'center'}
      >
        <Grid>
          <Stack spacing={CARD_GAP} alignItems="center">
            <Button variant="contained" onClick={handleBackClick}>
              Back to command center
            </Button>
            <MissionDetailsCard missionId={viewMissionDetailsId} />
          </Stack>
        </Grid>
        <Grid>
          <Stack spacing={CARD_GAP}>
            <BattleLogCard missionId={viewMissionDetailsId} />
          </Stack>
        </Grid>
        <Grid sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <CombatLogCard missionId={viewMissionDetailsId} />
        </Grid>
      </Grid>
    </Box>
  )
}
