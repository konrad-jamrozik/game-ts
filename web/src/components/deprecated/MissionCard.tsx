import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme, type SxProps } from '@mui/material/styles'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getMissionDefById } from '../../lib/collections/missions'
import { setMissionSelection } from '../../redux/slices/selectionSlice'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import type { MissionId } from '../../lib/model/missionModel'
import { LabeledValue } from '../Common/LabeledValue'
import { isMissionConcluded } from '../../lib/ruleset/missionRuleset'

export type MissionCardProps = { missionSiteId: MissionId }

export function MissionCard({ missionSiteId }: MissionCardProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const selectedMissionId = useAppSelector((state) => state.selection.selectedMissionId)
  const missions = useAppSelector((state) => state.undoable.present.gameState.missions)

  const mission = missions.find((m) => m.id === missionSiteId)
  if (!mission) {
    return <div>Mission site not found</div>
  }

  const missionDef = getMissionDefById(mission.missionDefId)

  const selected = selectedMissionId === mission.id
  const isDeployed = mission.state === 'Deployed'
  const disabled = isMissionConcluded(mission) || isDeployed

  // Remove the "mission-" prefix from the ID for display
  const displayId = fmtNoPrefix(mission.id, 'mission-')

  function handleClick(): void {
    if (!disabled && mission) {
      dispatch(setMissionSelection(mission.id))
    }
  }

  const selectedBoxShadow = 'inset 0 0 0 1000px hsla(0, 100%, 100%, 0.08)'
  const selectedSx: SxProps = selected ? { boxShadow: selectedBoxShadow } : {}
  const disabledSx: SxProps = disabled ? { opacity: 0.8 } : {}
  const missionCardHeaderSx: SxProps = { backgroundColor: theme.palette.background.missionCardHeader }
  const missionCardContentSx: SxProps = { backgroundColor: theme.palette.background.missionCardContent }
  const combinedHeaderSx: SxProps = { ...selectedSx, ...disabledSx, ...missionCardHeaderSx }
  const combinedContentSx: SxProps = { ...selectedSx, ...disabledSx, ...missionCardContentSx }

  return (
    <Card sx={disabledSx}>
      <CardActionArea
        onClick={disabled ? undefined : handleClick}
        disabled={disabled}
        data-active={selected ? '' : undefined}
      >
        {/* Note: the sx={combinedHeaderSx} and sx={combinedContentSx} must be defined on CardHeader and CardContent, not CardActionArea,
        to win in specificity over the styleOverrides in theme.tsx. */}
        <CardHeader title={missionDef.name} sx={combinedHeaderSx} />
        <CardContent sx={combinedContentSx}>
          <Stack>
            <Stack direction="row" justifyContent="space-between">
              <LabeledValue label="ID" value={displayId} sx={{ width: 100 }} />
              {mission.state === 'Active' ? (
                // For active missions, only show expiration info
                mission.expiresIn !== 'never' ? (
                  <LabeledValue label="Expires in" value={mission.expiresIn} sx={{ width: 138 }} />
                ) : (
                  <LabeledValue label="Does not expire" sx={{ width: 142 }} />
                )
              ) : (
                // For non-active missions, only show status
                <LabeledValue label="Status" value={mission.state} sx={{ width: 180 }} />
              )}
            </Stack>
          </Stack>
          <Typography sx={{ paddingTop: 1.7 }} variant="body1">
            {missionDef.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
