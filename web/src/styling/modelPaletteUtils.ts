import { type Theme, useTheme } from '@mui/material/styles'
import type { AgentState } from '../lib/model/model'

/**
 * Maps AgentState values to their corresponding palette color strings.
 * @param theme - The MUI theme object
 * @returns A Record mapping AgentState to color strings from the palette
 */
export function getModelPalette(theme: Theme): Record<AgentState, string> {
  const { agentStates } = theme.palette
  return {
    Available: agentStates.available,
    Terminated: agentStates.terminated,
    Recovering: agentStates.recovering,
    StartingTransit: agentStates.default,
    InTransit: agentStates.default,
    OnAssignment: agentStates.default,
    OnMission: agentStates.default,
  }
}

/**
 * Hook version that uses the current theme from context.
 * @returns A Record mapping AgentState to color strings from the palette
 */
export function useModelPalette(): Record<AgentState, string> {
  const theme = useTheme()
  return getModelPalette(theme)
}
