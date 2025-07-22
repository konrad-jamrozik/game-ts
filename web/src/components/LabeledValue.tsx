import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'

type LabeledValueProps = {
  label: string
  value: React.ReactNode
  width?: number | string
}

export function LabeledValue({ label, value, width }: LabeledValueProps): React.JSX.Element {
  return (
    <Paper
      sx={{
        padding: 1,
        width,
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
