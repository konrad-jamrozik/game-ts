import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Toolbar, type GridSlotsComponentsProps } from '@mui/x-data-grid'
import * as React from 'react'

// Allow passing custom props to the DataGrid toolbar slot for Missions grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    showArchived: boolean
    activeCount?: number
    archivedCount?: number
    onToggleArchived?: (checked: boolean) => void
  }
}

export function MissionsDataGridToolbar(props: NonNullable<GridSlotsComponentsProps['toolbar']>): React.JSX.Element {
  const { showArchived, activeCount, archivedCount, onToggleArchived } = props
  const isShowingArchived = showArchived === true

  function handleActiveChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.checked) {
      onToggleArchived?.(false)
    }
  }

  function handleArchivedChange(event: React.ChangeEvent<HTMLInputElement>): void {
    onToggleArchived?.(event.target.checked)
  }

  return (
    <Toolbar>
      <FormControlLabel
        control={
          <Checkbox
            checked={!isShowingArchived}
            onChange={handleActiveChange}
            slotProps={{ input: { 'aria-label': 'toggle-active-filter' } }}
            size="small"
          />
        }
        label={`Active (${activeCount ?? 0})`}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={isShowingArchived}
            onChange={handleArchivedChange}
            slotProps={{ input: { 'aria-label': 'toggle-archived-filter' } }}
            size="small"
          />
        }
        label={`Archived (${archivedCount ?? 0})`}
      />
    </Toolbar>
  )
}
