import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { LabeledValue } from './LabeledValue'

export type LeadCardProps = {
  id: string
  title: string
  intelCost: number
  description: string
  expiresIn: number | 'never'
  onClick?: () => void
  selected?: boolean
}

export function LeadCard({
  title,
  intelCost,
  description,
  expiresIn,
  onClick,
  selected,
}: LeadCardProps): React.JSX.Element {
  const selectedBoxShadow = 'inset 0 0 0 1000px hsla(0, 100%, 100%, 0.08)'
  const selectedSx = selected === true ? { boxShadow: selectedBoxShadow } : {}
  return (
    <Card>
      <CardActionArea onClick={onClick} data-active={selected === true ? '' : undefined}>
        {/* Note: the sx={selectedSx} must be defined on CardHeader and CardContent, not CardActionArea,
        to win over the styleOverrides in theme.tsx in specificity. */}
        <CardHeader title={title} sx={selectedSx} />
        <CardContent sx={selectedSx}>
          <Stack>
            <Stack direction="row" justifyContent="space-between">
              <LabeledValue label="Intel cost" value={intelCost} sx={{ width: 140 }} />
              {expiresIn !== 'never' ? (
                <LabeledValue label="Expires in" value={expiresIn} sx={{ width: 138 }} />
              ) : (
                <LabeledValue label="Does not expire" sx={{ width: 142 }} />
              )}
            </Stack>
          </Stack>
          <Typography sx={{ paddingTop: 1.7 }} variant="body1">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
