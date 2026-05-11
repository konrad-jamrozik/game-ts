import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Toolbar, type GridSlotProps } from '@mui/x-data-grid'
import * as React from 'react'
import { fmtDec1 } from '../../lib/primitives/formatPrimitives'
import type { AgentCounts } from './agentCounts'
import type { AgentsFilterType } from '../../redux/slices/selectionSlice'

// Allow passing custom props to the DataGrid toolbar slot for Agents grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    agentsFilterType: AgentsFilterType
    onAgentsFilterTypeChange?: (filterType: AgentsFilterType) => void
    selectedAgentsCombatRating?: number
    agentCounts?: AgentCounts
  }
}

export function AgentsToolbar(props: GridSlotProps['toolbar']): React.JSX.Element {
  const { agentsFilterType, onAgentsFilterTypeChange, selectedAgentsCombatRating, agentCounts } = props

  function handleFilterChange(nextFilterType: AgentsFilterType, checked: boolean): void {
    onAgentsFilterTypeChange?.(checked ? nextFilterType : 'all')
  }

  return (
    <Toolbar>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {selectedAgentsCombatRating !== undefined && selectedAgentsCombatRating > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 1 }}>
            <Typography variant="body2" component="span">
              Combat rating: {fmtDec1(selectedAgentsCombatRating)}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          {renderFilterCheckbox('all', `All (${agentCounts?.allActive ?? 0})`, agentsFilterType, handleFilterChange)}
          {renderFilterCheckbox('ready', `Ready (${agentCounts?.ready ?? 0})`, agentsFilterType, handleFilterChange)}
          {renderFilterCheckbox(
            'exhausted',
            `Exhausted (${agentCounts?.exhausted ?? 0})`,
            agentsFilterType,
            handleFilterChange,
          )}
          {renderFilterCheckbox('away', `Away (${agentCounts?.away ?? 0})`, agentsFilterType, handleFilterChange)}
          {renderFilterCheckbox(
            'recovering',
            `Recovering (${agentCounts?.recovering ?? 0})`,
            agentsFilterType,
            handleFilterChange,
          )}
          {renderFilterCheckbox('stats', `Stats (${agentCounts?.stats ?? 0})`, agentsFilterType, handleFilterChange)}
          {renderFilterCheckbox(
            'terminated',
            `Terminated (${agentCounts?.terminated ?? 0})`,
            agentsFilterType,
            handleFilterChange,
          )}
        </Box>
      </Box>
    </Toolbar>
  )
}

function renderFilterCheckbox(
  checkboxFilterType: AgentsFilterType,
  label: string,
  currentFilterType: AgentsFilterType,
  onFilterChange: (filterType: AgentsFilterType, checked: boolean) => void,
): React.JSX.Element {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    onFilterChange(checkboxFilterType, event.target.checked)
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
