import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Toolbar, type GridSlotsComponentsProps } from '@mui/x-data-grid'
import * as React from 'react'

// Allow passing custom props to the DataGrid toolbar slot for Leads grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    filterType: 'active' | 'inactive' | 'archived'
    onFilterTypeChange?: (filterType: 'active' | 'inactive' | 'archived') => void
  }
}

export function LeadsDataGridToolbar(props: NonNullable<GridSlotsComponentsProps['toolbar']>): React.JSX.Element {
  const { filterType, onFilterTypeChange } = props

  function handleInactiveChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.checked) {
      onFilterTypeChange?.('inactive')
    }
  }

  function handleArchivedChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.checked) {
      onFilterTypeChange?.('archived')
    }
  }

  function handleActiveChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.checked) {
      onFilterTypeChange?.('active')
    }
  }

  return (
    <Toolbar>
      <FormControlLabel
        control={
          <Checkbox
            checked={filterType === 'active'}
            onChange={handleActiveChange}
            slotProps={{ input: { 'aria-label': 'toggle-active-filter' } }}
            size="small"
          />
        }
        label="active"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={filterType === 'inactive'}
            onChange={handleInactiveChange}
            slotProps={{ input: { 'aria-label': 'toggle-inactive-filter' } }}
            size="small"
          />
        }
        label="inactive"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={filterType === 'archived'}
            onChange={handleArchivedChange}
            slotProps={{ input: { 'aria-label': 'toggle-archived-filter' } }}
            size="small"
          />
        }
        label="archived"
      />
    </Toolbar>
  )
}
