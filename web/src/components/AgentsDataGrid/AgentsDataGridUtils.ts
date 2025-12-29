import type { GridColDef } from '@mui/x-data-grid'
import type { AgentRow } from './getAgentsColumns'

export function filterAgentRows(
  allRows: AgentRow[],
  showOnlyTerminated: boolean,
  showOnlyAvailable: boolean,
  showOnlyRecovering: boolean,
  agentsTerminatedThisTurnIds: Set<string>,
): AgentRow[] {
  if (showOnlyAvailable) {
    return allRows.filter((agent) => agent.state === 'Available')
  }
  if (showOnlyTerminated) {
    return allRows.filter((agent) => agent.state === 'KIA' || agent.state === 'Sacked')
  }
  if (showOnlyRecovering) {
    return allRows.filter((agent) => agent.assignment === 'Recovery')
  }
  // Default: show all non-terminated agents, plus agents terminated this turn
  return allRows.filter(
    (agent) => (agent.state !== 'KIA' && agent.state !== 'Sacked') || agentsTerminatedThisTurnIds.has(agent.id),
  )
}

export function filterVisibleAgentColumns(
  columns: GridColDef[],
  showOnlyTerminated: boolean,
  showRecovering: boolean,
  showStats: boolean,
): GridColDef[] {
  if (showOnlyTerminated) {
    return columns.filter(
      (col) =>
        col.field === 'id' ||
        col.field === 'skillSimple' ||
        col.field === 'hitPointsMax' ||
        col.field === 'service' ||
        col.field === 'missionsTotal' ||
        col.field === 'mission' ||
        col.field === 'by',
    )
  }
  if (showRecovering) {
    return columns.filter(
      (col) =>
        col.field === 'id' ||
        col.field === 'state' ||
        col.field === 'recoveryTurns' ||
        col.field === 'exhaustionPct' ||
        col.field === 'hitPoints' ||
        col.field === 'skillSimple',
    )
  }
  if (showStats) {
    // When "stats" is selected, show only: id, skillSimple, training, hitPointsMax, missionsTotal, service
    return columns.filter(
      (col) =>
        col.field === 'id' ||
        col.field === 'skillSimple' ||
        col.field === 'training' ||
        col.field === 'hitPointsMax' ||
        col.field === 'missionsTotal' ||
        col.field === 'service',
    )
  }
  return columns.filter(
    (col) =>
      col.field === 'id' ||
      col.field === 'state' ||
      col.field === 'assignment' ||
      col.field === 'skill' ||
      col.field === 'exhaustionPct',
  )
}
