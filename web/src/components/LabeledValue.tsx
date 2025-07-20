import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import * as React from 'react'

type LabeledValueProps = {
  label: string
  value: React.ReactNode
}

export function LabeledValue({ label, value }: LabeledValueProps): React.JSX.Element {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body1">{label}:</Typography>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Stack>
  )
}
