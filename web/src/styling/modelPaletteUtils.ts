import type { ChipPropsColorOverrides } from '@mui/material'
import type { AgentState } from '../lib/model/model'
import type { OverridableStringUnion } from '@mui/types'

export type MyPaletteColor = OverridableStringUnion<
  'success' | 'error' | 'warning' | 'default' | 'primary' | 'secondary' | 'info',
  ChipPropsColorOverrides
>

/**
 * Maps AgentState values to their corresponding palette color strings.
 * @param theme - The MUI theme object
 * @returns A Record mapping AgentState to color strings from the palette
 */
export function getModelPalette(): Record<AgentState, MyPaletteColor> {
  return {
    Available: 'agentStateAvailable',
    Terminated: 'agentStateTerminated',
    Recovering: 'agentStateRecovering',
    StartingTransit: 'agentStateInTransit',
    InTransit: 'agentStateInTransit',
    OnAssignment: 'agentStateOnAssignment',
    OnMission: 'agentStateOnMission',
  }
}
