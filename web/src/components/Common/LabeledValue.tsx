import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import * as React from 'react'
import { Fragment } from 'react'
import { combineSx } from '../styling/stylePrimitives'

type LabeledValueProps = {
  label: string
  value?: React.ReactNode
  sx?: SxProps<Theme>
}

export function LabeledValue({ label, value, sx }: LabeledValueProps): React.JSX.Element {
  const paperSx: SxProps<Theme> = {
    paddingY: 0.5,
    paddingX: 1.5,
  }

  return (
    <Paper sx={combineSx(paperSx, sx)}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {value === undefined ? (
          <Typography variant="body1">{label}</Typography>
        ) : (
          <Fragment>
            <Typography variant="body1" id={`label-${label}`}>
              {label}:
            </Typography>
            <Typography variant="body1" aria-labelledby={`label-${label}`} sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Fragment>
        )}
      </Stack>
    </Paper>
  )
}
