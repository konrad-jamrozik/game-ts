import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme, type SxProps } from '@mui/material/styles'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getMissionById } from '../collections/missions'
import { setMissionSelection } from '../model/selectionSlice'
import { LabeledValue } from './LabeledValue'

export type MissionCardProps = { missionSiteId: string }

export function MissionCard({ missionSiteId }: MissionCardProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const selectedMissionId = useAppSelector((state) => state.selection.selectedMissionId)
  const missionSites = useAppSelector((state) => state.undoable.present.gameState.missionSites)

  const missionSite = missionSites.find((site) => site.id === missionSiteId)
  if (!missionSite) {
    return <div>Mission site not found</div>
  }

  const mission = getMissionById(missionSite.missionId)

  const selected = selectedMissionId === missionSite.id
  const disabled =
    missionSite.state === 'Deployed' || missionSite.state === 'Successful' || missionSite.state === 'Failed'

  // Remove the "mission-site-" prefix from the ID for display
  const displayId = missionSite.id.replace(/^mission-site-/u, '')

  function handleClick(): void {
    if (!disabled && missionSite) {
      dispatch(setMissionSelection(missionSite.id))
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
        <CardHeader title={mission.title} sx={combinedHeaderSx} />
        <CardContent sx={combinedContentSx}>
          <Stack>
            <Stack direction="row" justifyContent="space-between">
              <LabeledValue label="ID" value={displayId} sx={{ width: 100 }} />
              {missionSite.state === 'Active' ? (
                // For active mission sites, only show expiration info
                mission.expiresIn !== 'never' ? (
                  <LabeledValue label="Expires in" value={mission.expiresIn} sx={{ width: 138 }} />
                ) : (
                  <LabeledValue label="Does not expire" sx={{ width: 142 }} />
                )
              ) : (
                // For non-active mission sites, only show status
                <LabeledValue label="Status" value={missionSite.state} sx={{ width: 180 }} />
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
