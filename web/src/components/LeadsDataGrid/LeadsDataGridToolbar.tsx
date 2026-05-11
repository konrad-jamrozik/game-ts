import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Toolbar, type GridSlotProps } from '@mui/x-data-grid'
import * as React from 'react'
import type { LeadsFilterType } from '../../redux/slices/selectionSlice'
import type { LeadCounts } from './leadCounts'

// Allow passing custom props to the DataGrid toolbar slot for Leads grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    filterType: LeadsFilterType
    leadCounts?: LeadCounts
    onFilterTypeChange?: (filterType: LeadsFilterType) => void
  }
}

export function LeadsDataGridToolbar(props: GridSlotProps['toolbar']): React.JSX.Element {
  const { filterType, leadCounts, onFilterTypeChange } = props

  function handleInactiveChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.checked) {
      onFilterTypeChange?.('inactive')
    } else {
      onFilterTypeChange?.('active')
    }
  }

  function handleArchivedChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.checked) {
      onFilterTypeChange?.('archived')
    } else {
      onFilterTypeChange?.('active')
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
        label={`Active (${leadCounts?.active ?? 0})`}
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
        label={`Inactive (${leadCounts?.inactive ?? 0})`}
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
        label={`Archived (${leadCounts?.archived ?? 0})`}
      />
    </Toolbar>
  )
}
