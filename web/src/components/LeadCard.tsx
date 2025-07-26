import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/material/styles'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import type { Lead } from '../model/model'
import { setLeadSelection } from '../model/selectionSlice'
import { LabeledValue } from './LabeledValue'

export type LeadCardProps = Lead & {
  selected?: boolean
  disabled?: boolean
}

export function LeadCard(ps: LeadCardProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const investigatedLeads = useAppSelector((state) => state.undoable.present.gameState.investigatedLeads)

  function handleClick(): void {
    if (!investigatedLeads.includes(ps.id)) {
      dispatch(setLeadSelection(ps.id))
    }
  }

  const selectedBoxShadow = 'inset 0 0 0 1000px hsla(0, 100%, 100%, 0.08)'
  const selectedSx: SxProps = ps.selected === true ? { boxShadow: selectedBoxShadow } : {}
  const disabledSx: SxProps = ps.disabled === true ? { opacity: 0.5 } : {}
  const combinedSx: SxProps = { ...selectedSx, ...disabledSx }

  return (
    <Card sx={disabledSx}>
      <CardActionArea
        onClick={ps.disabled === true ? undefined : handleClick}
        disabled={ps.disabled === true}
        data-active={ps.selected === true ? '' : undefined}
      >
        {/* Note: the sx={combinedSx} must be defined on CardHeader and CardContent, not CardActionArea,
        to win in specificity over the styleOverrides in theme.tsx. */}
        <CardHeader title={ps.title} sx={combinedSx} />
        <CardContent sx={combinedSx}>
          <Stack>
            <Stack direction="row" justifyContent="space-between">
              <LabeledValue label="Intel cost" value={ps.intelCost} sx={{ width: 140 }} />
              {ps.expiresIn !== 'never' ? (
                <LabeledValue label="Expires in" value={ps.expiresIn} sx={{ width: 138 }} />
              ) : (
                <LabeledValue label="Does not expire" sx={{ width: 142 }} />
              )}
            </Stack>
          </Stack>
          <Typography sx={{ paddingTop: 1.7 }} variant="body1">
            {ps.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
