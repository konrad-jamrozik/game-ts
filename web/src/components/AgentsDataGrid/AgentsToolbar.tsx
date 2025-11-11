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
    showOnlyAvailable: boolean
    onToggleAvailable?: (checked: boolean) => void
    showDetailed: boolean
    onToggleDetailed?: (checked: boolean) => void
  }
}

export function AgentsToolbar(props: NonNullable<GridSlotsComponentsProps['toolbar']>): React.JSX.Element {
  const {
    showOnlyTerminated,
    onToggleTerminated,
    showOnlyAvailable,
    onToggleAvailable,
    showDetailed,
    onToggleDetailed,
  } = props
  // KJA only one from "Available" and "Terminated" should be selectable at once.
  return (
    <Toolbar>
      <FormControlLabel
        control={
          <Checkbox
            checked={showDetailed}
            onChange={(event) => onToggleDetailed?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-detailed-view' } }}
            size="small"
          />
        }
        label="detailed"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showOnlyAvailable}
            onChange={(event) => onToggleAvailable?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-available-filter' } }}
            size="small"
          />
        }
        label="available"
      />
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
