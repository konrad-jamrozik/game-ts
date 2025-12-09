import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme, type SxProps } from '@mui/material/styles'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getLeadById } from '../../lib/collections/leads'
import { setLeadSelection, clearInvestigationSelection } from '../../redux/slices/selectionSlice'
import { LabeledValue } from '../Common/LabeledValue'

export type LeadCardProps = {
  leadId: string
  displayMode?: 'normal' | 'repeated'
}

export function LeadCard({ leadId, displayMode = 'normal' }: LeadCardProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const leadInvestigationCounts = useAppSelector((state) => state.undoable.present.gameState.leadInvestigationCounts)
  const leadInvestigations = useAppSelector((state) => state.undoable.present.gameState.leadInvestigations)
  const lead = getLeadById(leadId)

  const selected = selectedLeadId === lead.id && displayMode === 'normal'
  // Check specifically for Active investigations (not just any investigation)
  const hasActiveInvestigation = Object.values(leadInvestigations).some(
    (investigation) => investigation.leadId === lead.id && investigation.state === 'Active',
  )
  // Check for completed investigations (archived leads)
  const hasCompletedInvestigation = Object.values(leadInvestigations).some(
    (investigation) => investigation.leadId === lead.id && investigation.state === 'Completed',
  )
  // Disable if:
  // - displayMode is 'repeated' (repeatable leads that have been investigated)
  // - non-repeatable with active investigation (under investigation)
  // - non-repeatable with completed investigation (archived)
  const disabled =
    displayMode === 'repeated' || (!lead.repeatable && (hasActiveInvestigation || hasCompletedInvestigation))

  function handleClick(): void {
    if (!disabled) {
      // Clear investigation selection when lead is selected
      dispatch(clearInvestigationSelection())
      dispatch(setLeadSelection(lead.id))
    }
  }

  const selectedBoxShadow = 'inset 0 0 0 1000px hsla(0, 100%, 100%, 0.08)'
  const selectedSx: SxProps = selected ? { boxShadow: selectedBoxShadow } : {}
  const disabledSx: SxProps = disabled ? { opacity: 0.8 } : {}
  const leadCardHeaderSx: SxProps = { backgroundColor: theme.palette.background.leadCardHeader }
  const leadCardContentSx: SxProps = { backgroundColor: theme.palette.background.leadCardContent }
  const combinedHeaderSx: SxProps = { ...selectedSx, ...disabledSx, ...leadCardHeaderSx }
  const combinedContentSx: SxProps = { ...selectedSx, ...disabledSx, ...leadCardContentSx }

  return (
    <Card sx={disabledSx}>
      <CardActionArea
        onClick={disabled ? undefined : handleClick}
        disabled={disabled}
        data-active={selected ? '' : undefined}
      >
        {/* Note: the sx={combinedHeaderSx} and sx={combinedContentSx} must be defined on CardHeader and CardContent, not CardActionArea,
        to win in specificity over the styleOverrides in theme.tsx. */}
        <CardHeader title={lead.title} sx={combinedHeaderSx} />
        <CardContent sx={combinedContentSx}>
          <Stack>
            <Stack direction="row" sx={{ paddingTop: 0.5 }}>
              <LabeledValue label="Difficulty" value={lead.difficulty} />
            </Stack>
            {displayMode === 'normal' && lead.repeatable && (
              <Stack direction="row" sx={{ paddingTop: 0.5 }}>
                <LabeledValue label="Repeatable" />
              </Stack>
            )}
            {displayMode === 'repeated' && (
              <Stack direction="row" sx={{ paddingTop: 0.5 }}>
                <LabeledValue label="Repeated" value={leadInvestigationCounts[leadId] ?? 0} />
              </Stack>
            )}
          </Stack>
          <Typography sx={{ paddingTop: 1.7 }} variant="body1">
            {lead.description}
          </Typography>
          {lead.enemyEstimate !== undefined && (
            <Typography
              sx={{ paddingTop: 1, fontStyle: 'italic', color: theme.palette.text.secondary }}
              variant="body2"
            >
              {lead.enemyEstimate}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
