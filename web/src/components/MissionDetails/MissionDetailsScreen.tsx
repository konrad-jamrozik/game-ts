import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewMissionDetails } from '../../redux/slices/selectionSlice'
import { MissionSiteDetailsCard } from './MissionSiteDetailsCard'
import { CombatLogCard } from './CombatLogCard'
import { BattleLogCard } from './BattleLogCard'
import { LEFT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'

export function MissionDetailsScreen(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const viewMissionDetailsId = useAppSelector((state) => state.selection.viewMissionDetailsId)

  if (viewMissionDetailsId === undefined) {
    return <div>No mission selected</div>
  }

  function handleBackClick(): void {
    dispatch(clearViewMissionDetails())
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
      alignItems="stretch"
    >
      <Grid>
        <Stack spacing={2} sx={{ width: LEFT_COLUMN_CARD_WIDTH }}>
          <Button variant="contained" onClick={handleBackClick} sx={{ alignSelf: 'flex-start' }}>
            Back to command center
          </Button>
          <MissionSiteDetailsCard missionSiteId={viewMissionDetailsId} />
        </Stack>
      </Grid>
      <Grid>
        <Stack spacing={2}>
          <BattleLogCard />
          <CombatLogCard />
        </Stack>
      </Grid>
    </Grid>
  )
}
