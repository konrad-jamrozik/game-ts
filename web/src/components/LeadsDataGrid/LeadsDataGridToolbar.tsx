import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Toolbar, type GridSlotsComponentsProps } from '@mui/x-data-grid'
import * as React from 'react'

// Allow passing custom props to the DataGrid toolbar slot for Leads grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    showArchived: boolean
    onToggleArchived?: (checked: boolean) => void
  }
}

export function LeadsDataGridToolbar(props: NonNullable<GridSlotsComponentsProps['toolbar']>): React.JSX.Element {
  const { showArchived, onToggleArchived } = props
  return (
    <Toolbar>
      <FormControlLabel
        control={
          <Checkbox
            checked={showArchived}
            onChange={(event) => onToggleArchived?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-archived-filter' } }}
            size="small"
          />
        }
        label="archived"
      />
    </Toolbar>
  )
}
