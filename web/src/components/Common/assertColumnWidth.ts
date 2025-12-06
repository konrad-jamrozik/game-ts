import type { GridColDef } from '@mui/x-data-grid'

export function assertColumnWidth(
  columns: GridColDef[],
  expectedWidth: number,
  gridName: string,
  fieldFilter?: Set<string>,
): void {
  const columnsToCheck = fieldFilter ? columns.filter((col) => fieldFilter.has(col.field)) : columns

  const actualWidth = columnsToCheck.reduce((sum, col) => sum + (col.width ?? 0), 0)
  if (actualWidth !== expectedWidth) {
    const filterDescription = fieldFilter ? ' (filtered)' : ''
    throw new Error(
      `${gridName} columns total width mismatch${filterDescription}: expected ${expectedWidth}, got ${actualWidth}`,
    )
  }
}
