import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme, type SxProps } from '@mui/material/styles'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { getLeadById } from '../collections/leads'
import { setLeadSelection } from '../model/selectionSlice'
import { LabeledValue } from './LabeledValue'

export type LeadCardProps = {
  leadId: string
  displayMode?: 'normal' | 'repeated'
}

export function LeadCard({ leadId, displayMode = 'normal' }: LeadCardProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const selectedLeadId = useAppSelector((state) => state.selection.selectedLeadId)
  const investigatedLeadIds = useAppSelector((state) => state.undoable.present.gameState.investigatedLeadIds)
  const leadInvestigationCounts = useAppSelector((state) => state.undoable.present.gameState.leadInvestigationCounts)
  const lead = getLeadById(leadId)

  const selected = selectedLeadId === lead.id && displayMode === 'normal'
  const disabled = displayMode === 'repeated' || (!lead.repeatable && investigatedLeadIds.includes(lead.id))

  function handleClick(): void {
    if (!disabled) {
      dispatch(setLeadSelection(lead.id))
    }
  }

  const selectedBoxShadow = 'inset 0 0 0 1000px hsla(0, 100%, 100%, 0.08)'
  const selectedSx: SxProps = selected ? { boxShadow: selectedBoxShadow } : {}
  const disabledSx: SxProps = disabled ? { opacity: 0.5 } : {}
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
            <Stack direction="row" justifyContent="space-between">
              <LabeledValue label="Intel cost" value={lead.intelCost} sx={{ width: 140 }} />
              {lead.expiresIn !== 'never' ? (
                <LabeledValue label="Expires in" value={lead.expiresIn} sx={{ width: 138 }} />
              ) : (
                <LabeledValue label="Does not expire" sx={{ width: 142 }} />
              )}
            </Stack>
            {displayMode === 'normal' && lead.repeatable && !investigatedLeadIds.includes(lead.id) && (
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
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
