import type { LeadInvestigationRow } from './LeadInvestigationsDataGrid'

export function filterLeadInvestigationRows(
  allInvestigationRows: LeadInvestigationRow[],
  showActive: boolean,
  showDone: boolean,
  showAbandoned: boolean,
): LeadInvestigationRow[] {
  return allInvestigationRows
    .filter((row) => {
      // If investigation was completed this turn, show it in both "active" and "done" when those are selected
      if (row.completedThisTurn && row.state === 'Done') {
        return showActive || showDone
      }
      // Otherwise filter by state
      if (row.state === 'Active') {
        return showActive
      }
      if (row.state === 'Done') {
        return showDone
      }
      return showAbandoned
    })
    .toSorted((rowA, rowB) => rowB.name.localeCompare(rowA.name))
}
