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
    .sort((rowA, rowB) => rowB.leadInvestigationTitle.localeCompare(rowA.leadInvestigationTitle))
}

export function filterAgentRows(
  allRows: AgentRow[],
  showOnlyTerminated: boolean,
  showOnlyAvailable: boolean,
): AgentRow[] {
  if (showOnlyAvailable) {
    return allRows.filter((agent) => agent.state === 'Available')
  }
  if (showOnlyTerminated) {
    return allRows.filter((agent) => agent.state === 'Terminated')
  }
  return allRows.filter((agent) => agent.state !== 'Terminated')
}

export function filterVisibleAgentColumns(columns: GridColDef[], showDetailed: boolean): GridColDef[] {
  return showDetailed ? columns : columns.filter((col) => col.field !== 'hitPoints' && col.field !== 'recoveryTurns')
}
