import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Toolbar, type GridSlotsComponentsProps } from '@mui/x-data-grid'
import * as React from 'react'

// Allow passing custom props to the DataGrid toolbar slot for Agents grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    showOnlyTerminated: boolean
    onToggleTerminated?: (checked: boolean) => void
  }
}

export function AgentsToolbar(props: NonNullable<GridSlotsComponentsProps['toolbar']>): React.JSX.Element {
  const { showOnlyTerminated, onToggleTerminated } = props
  return (
    <Toolbar>
      <FormControlLabel
        control={
          <Checkbox
            checked={showOnlyTerminated}
            onChange={(event) => onToggleTerminated?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-terminated-filter' } }}
            size="small"
          />
        }
        label="terminated"
      />
    </Toolbar>
  )
}
