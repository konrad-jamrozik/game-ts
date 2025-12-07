import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Toolbar, type GridSlotsComponentsProps } from '@mui/x-data-grid'
import * as React from 'react'

// Allow passing custom props to the DataGrid toolbar slot for Combat Log grid
declare module '@mui/x-data-grid' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ToolbarPropsOverrides {
    showAgentAttacks: boolean
    onToggleAgentAttacks?: (checked: boolean) => void
    showEnemyAttacks: boolean
    onToggleEnemyAttacks?: (checked: boolean) => void
  }
}

export function CombatLogToolbar(props: NonNullable<GridSlotsComponentsProps['toolbar']>): React.JSX.Element {
  const { showAgentAttacks, onToggleAgentAttacks, showEnemyAttacks, onToggleEnemyAttacks } = props
  return (
    <Toolbar>
      <FormControlLabel
        control={
          <Checkbox
            checked={showAgentAttacks}
            onChange={(event) => onToggleAgentAttacks?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-agent-attacks-filter' } }}
            size="small"
          />
        }
        label="Agent attacks"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showEnemyAttacks}
            onChange={(event) => onToggleEnemyAttacks?.(event.target.checked)}
            slotProps={{ input: { 'aria-label': 'toggle-enemy-attacks-filter' } }}
            size="small"
          />
        }
        label="Enemy attacks"
      />
    </Toolbar>
  )
}
