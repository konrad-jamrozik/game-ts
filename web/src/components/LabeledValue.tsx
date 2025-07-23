import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import * as React from 'react'

type LabeledValueProps = {
  label: string
  value: React.ReactNode
  sx?: SxProps<Theme>
}

export function LabeledValue({ label, value, sx }: LabeledValueProps): React.JSX.Element {
  const resolvedSx = sx ?? {}
  return (
    <Paper
      sx={{
        padding: 1,
        paddingX: 1.5,
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...resolvedSx,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body1" id={`label-${label}`}>
          {label}:
        </Typography>
        <Typography variant="body1" aria-labelledby={`label-${label}`} sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Stack>
    </Paper>
  )
}
