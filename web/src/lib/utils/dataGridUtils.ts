import type { GridColDef } from '@mui/x-data-grid'
import type { AgentRow } from '../../components/AgentsDataGrid/AgentsDataGrid'
import type { LeadInvestigationRow } from '../../components/LeadInvestigationsDataGrid'

export function filterLeadInvestigationRows(
  allInvestigationRows: LeadInvestigationRow[],
  showActive: boolean,
  showDone: boolean,
  showAbandoned: boolean,
): LeadInvestigationRow[] {
  return allInvestigationRows
    .filter((row) => {
      // If investigation was completed this turn, show it in both "active" and "done" when those are selected
      if (row.completedThisTurn && row.state === 'Successful') {
        return showActive || showDone
      }
      // Otherwise filter by state
      if (row.state === 'Active') {
        return showActive
      }
      if (row.state === 'Successful') {
        return showDone
      }
      return showAbandoned
    })
    .toSorted((rowA, rowB) => rowB.leadInvestigationTitle.localeCompare(rowA.leadInvestigationTitle))
}

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
    return allRows.filter((agent) => agent.state === 'Terminated')
  }
  if (showOnlyRecovering) {
    return allRows.filter((agent) => agent.assignment === 'Recovery')
  }
  // Default: show all non-terminated agents, plus agents terminated this turn
  return allRows.filter((agent) => agent.state !== 'Terminated' || agentsTerminatedThisTurnIds.has(agent.id))
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
        col.field === 'exhaustion' ||
        col.field === 'hitPoints' ||
        col.field === 'skillSimple',
    )
  }
  if (showStats) {
    // When "stats" is selected, show only: id, skillSimple, hitPointsMax, missionsTotal, service
    return columns.filter(
      (col) =>
        col.field === 'id' ||
        col.field === 'skillSimple' ||
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
      col.field === 'exhaustion',
  )
}
