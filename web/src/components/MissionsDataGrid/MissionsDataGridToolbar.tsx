import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Toolbar, type GridSlotProps } from '@mui/x-data-grid'
import * as React from 'react'
import type { MissionsFilterType } from '../../redux/slices/selectionSlice'

// Allow passing custom props to the DataGrid toolbar slot for Missions grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    missionsFilterType: MissionsFilterType
    allCount?: number
    expiringSoonCount?: number
    deployedCount?: number
    archivedCount?: number
    onMissionsFilterTypeChange?: (filterType: MissionsFilterType) => void
  }
}

export function MissionsDataGridToolbar(props: GridSlotProps['toolbar']): React.JSX.Element {
  const {
    missionsFilterType,
    allCount,
    expiringSoonCount,
    deployedCount,
    archivedCount,
    onMissionsFilterTypeChange,
  } = props

  return (
    <Toolbar>
      {renderFilterCheckbox('all', `All (${allCount ?? 0})`, missionsFilterType, onMissionsFilterTypeChange)}
      {renderFilterCheckbox(
        'expiringSoon',
        `Expiring soon (${expiringSoonCount ?? 0})`,
        missionsFilterType,
        onMissionsFilterTypeChange,
      )}
      {renderFilterCheckbox(
        'deployed',
        `Deployed (${deployedCount ?? 0})`,
        missionsFilterType,
        onMissionsFilterTypeChange,
      )}
      {renderFilterCheckbox(
        'archived',
        `Archived (${archivedCount ?? 0})`,
        missionsFilterType,
        onMissionsFilterTypeChange,
      )}
    </Toolbar>
  )
}

function renderFilterCheckbox(
  checkboxFilterType: MissionsFilterType,
  label: string,
  currentFilterType: MissionsFilterType,
  onFilterTypeChange: ((filterType: MissionsFilterType) => void) | undefined,
): React.JSX.Element {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.checked) {
      onFilterTypeChange?.(checkboxFilterType)
    } else {
      onFilterTypeChange?.('all')
    }
  }

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={currentFilterType === checkboxFilterType}
          onChange={handleChange}
          slotProps={{ input: { 'aria-label': `toggle-${checkboxFilterType}-filter` } }}
          size="small"
        />
      }
      label={label}
    />
  )
}
