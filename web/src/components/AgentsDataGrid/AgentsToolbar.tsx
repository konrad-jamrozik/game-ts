import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Toolbar, type GridSlotsComponentsProps } from '@mui/x-data-grid'
import * as React from 'react'
import { fmtDec1 } from '../../lib/primitives/formatPrimitives'

// Allow passing custom props to the DataGrid toolbar slot for Agents grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    showOnlyTerminated: boolean
    onToggleTerminated?: (checked: boolean) => void
    showOnlyAvailable: boolean
    onToggleAvailable?: (checked: boolean) => void
    showRecovering: boolean
    onToggleRecovering?: (checked: boolean) => void
    showStats: boolean
    onToggleStats?: (checked: boolean) => void
    selectedAgentsCombatRating?: number
  }
}

export function AgentsToolbar(props: NonNullable<GridSlotsComponentsProps['toolbar']>): React.JSX.Element {
  const {
    showOnlyTerminated,
    onToggleTerminated,
    showOnlyAvailable,
    onToggleAvailable,
    showRecovering,
    onToggleRecovering,
    showStats,
    onToggleStats,
    selectedAgentsCombatRating,
  } = props
  return (
    <Toolbar>
      <Box display="flex" alignItems="center" width="100%">
        {selectedAgentsCombatRating !== undefined && selectedAgentsCombatRating > 0 && (
          <Box display="flex" alignItems="center" marginLeft={1}>
            <Typography variant="body2" component="span">
              Combat rating: {fmtDec1(selectedAgentsCombatRating)}
            </Typography>
          </Box>
        )}
        <Box display="flex" alignItems="center" marginLeft="auto">
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
                checked={showRecovering}
                onChange={(event) => onToggleRecovering?.(event.target.checked)}
                slotProps={{ input: { 'aria-label': 'toggle-recovering-view' } }}
                size="small"
              />
            }
            label="recovering"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showStats}
                onChange={(event) => onToggleStats?.(event.target.checked)}
                slotProps={{ input: { 'aria-label': 'toggle-stats-view' } }}
                size="small"
              />
            }
            label="stats"
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
        </Box>
      </Box>
    </Toolbar>
  )
}
