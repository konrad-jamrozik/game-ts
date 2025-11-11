import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Toolbar, type GridSlotsComponentsProps } from '@mui/x-data-grid'
import * as React from 'react'

// Allow passing custom props to the DataGrid toolbar slot for Lead Investigations grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    showActive: boolean
    onToggleActive?: (checked: boolean) => void
    showDone: boolean
    onToggleDone?: (checked: boolean) => void
    showAbandoned: boolean
    onToggleAbandoned?: (checked: boolean) => void
  }
}

export function LeadInvestigationsToolbar(props: NonNullable<GridSlotsComponentsProps['toolbar']>): React.JSX.Element {
  const { showActive, onToggleActive, showDone, onToggleDone, showAbandoned, onToggleAbandoned } = props
  return (
    <Toolbar>
      <FormControlLabel
        control={
          <Checkbox
            checked={showActive}
            onChange={(event) => onToggleActive?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-active-filter' } }}
            size="small"
          />
        }
        label="active"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showDone}
            onChange={(event) => onToggleDone?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-done-filter' } }}
            size="small"
          />
        }
        label="done"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showAbandoned}
            onChange={(event) => onToggleAbandoned?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-abandoned-filter' } }}
            size="small"
          />
        }
        label="abandoned"
      />
    </Toolbar>
  )
}
