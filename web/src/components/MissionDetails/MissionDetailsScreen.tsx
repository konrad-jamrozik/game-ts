import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewMissionDetails } from '../../redux/slices/selectionSlice'
import { MissionSiteDetailsCard } from './MissionSiteDetailsCard'
import { CombatLogCard } from './CombatLogCard'
import { BattleLogCard } from './BattleLogCard'

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
    <Grid
      container
      direction="row"
      spacing={2}
      padding={2}
      paddingX={1}
      bgcolor={'#30303052'}
      flexWrap={'wrap'}
      justifyContent={'center'}
    >
      <Grid>
        <Stack spacing={2} alignItems="center">
          <Button variant="contained" onClick={handleBackClick}>
            Back to command center
          </Button>
          <MissionSiteDetailsCard missionSiteId={viewMissionDetailsId} />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={2}>
          <BattleLogCard missionSiteId={viewMissionDetailsId} />
          <CombatLogCard missionSiteId={viewMissionDetailsId} />
        </Stack>
      </Grid>
    </Grid>
  )
}
