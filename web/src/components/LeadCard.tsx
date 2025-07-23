import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { LabeledValue } from './LabeledValue'

export type LeadCardProps = {
  title: string
  intelCost: number
  description: string
  expiresIn: number
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
  console.log(`rendering LeadCard: ${title}. selected: ${selected}`)
  return (
    <Card>
      <CardActionArea
        onClick={onClick}
        data-active={selected === true ? '' : undefined}
        sx={(theme) => ({
          height: '100%',
          '&[data-active]': {
            bgcolor: 'green', //theme.palette.action.selected,
          },
        })}
      >
        <CardHeader
          title={title}
          sx={(theme) => ({
            // backgroundColor: theme.palette.background.nestedCardHeader,
          })}
        />
        <CardContent
          sx={(theme) => ({
            // backgroundColor: theme.palette.background.nestedCardContent,
          })}
        >
          <Stack>
            <Stack direction="row" justifyContent="space-between">
              <LabeledValue label="Intel cost" value={intelCost} sx={{ width: 140 }} />
              <LabeledValue label="Expires in" value={expiresIn} sx={{ width: 138 }} />
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
