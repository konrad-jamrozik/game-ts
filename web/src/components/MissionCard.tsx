import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/material/styles'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getMissionById } from '../collections/missions'
import { setMissionSelection } from '../model/selectionSlice'
import { LabeledValue } from './LabeledValue'

export type MissionCardProps = { missionId: string }

export function MissionCard({ missionId }: MissionCardProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const selectedMissionId = useAppSelector((state) => state.selection.selectedMissionId)
  const deployedMissionIds = useAppSelector((state) => state.undoable.present.gameState.deployedMissionIds)
  const mission = getMissionById(missionId)

  const selected = selectedMissionId === mission.id
  const disabled = deployedMissionIds.includes(mission.id)

  function handleClick(): void {
    if (!disabled) {
      dispatch(setMissionSelection(mission.id))
    }
  }

  const selectedBoxShadow = 'inset 0 0 0 1000px hsla(0, 100%, 100%, 0.08)'
  const selectedSx: SxProps = selected ? { boxShadow: selectedBoxShadow } : {}
  const disabledSx: SxProps = disabled ? { opacity: 0.5 } : {}
  const combinedSx: SxProps = { ...selectedSx, ...disabledSx }

  return (
    <Card sx={disabledSx}>
      <CardActionArea
        onClick={disabled ? undefined : handleClick}
        disabled={disabled}
        data-active={selected ? '' : undefined}
      >
        {/* Note: the sx={combinedSx} must be defined on CardHeader and CardContent, not CardActionArea,
        to win in specificity over the styleOverrides in theme.tsx. */}
        <CardHeader title={mission.title} sx={combinedSx} />
        <CardContent sx={combinedSx}>
          <Stack>
            <Stack direction="row" justifyContent="space-between">
              {mission.expiresIn !== 'never' ? (
                <LabeledValue label="Expires in" value={mission.expiresIn} sx={{ width: 138 }} />
              ) : (
                <LabeledValue label="Does not expire" sx={{ width: 142 }} />
              )}
            </Stack>
          </Stack>
          <Typography sx={{ paddingTop: 1.7 }} variant="body1">
            {mission.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
