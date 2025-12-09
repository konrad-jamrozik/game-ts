import type { GridSortCellParams } from '@mui/x-data-grid'
import { f6cmp, f6eq, type Fixed6 } from '../../lib/primitives/fixed6'
import { assertDefined } from '../../lib/primitives/assertPrimitives'

/**
 * Creates a sort comparator for Fixed6 skill columns in DataGrid.
 * Finds rows by ID and compares Fixed6 values, with fallback to row ID for stable sorting.
 *
 * @param rows - Array of all rows in the DataGrid
 * @param getValue - Function to extract the Fixed6 value from a row
 * @returns A sort comparator function for use in GridColDef.sortComparator
 */
export function createFixed6SortComparator<T extends { id: number | string }>(
  rows: T[],
  getValue: (row: T) => Fixed6,
): (_v1: unknown, _v2: unknown, param1: GridSortCellParams<unknown>, param2: GridSortCellParams<unknown>) => number {
  return (
    _v1: unknown,
    _v2: unknown,
    param1: GridSortCellParams<unknown>,
    param2: GridSortCellParams<unknown>,
  ): number => {
    // Find the rows from our typed rows array using the row IDs
    const row1 = rows.find((row) => row.id === param1.id)
    const row2 = rows.find((row) => row.id === param2.id)

    assertDefined(row1, `Row not found for id: ${param1.id}`)
    assertDefined(row2, `Row not found for id: ${param2.id}`)

    const value1 = getValue(row1)
    const value2 = getValue(row2)

    // Primary sort: Fixed6 value comparison
    if (!f6eq(value1, value2)) {
      return f6cmp(value1, value2)
    }

    // Secondary sort: row ID (for stable sorting)
    if (typeof row1.id === 'string' && typeof row2.id === 'string') {
      return row1.id.localeCompare(row2.id)
    }
    if (typeof row1.id === 'number' && typeof row2.id === 'number') {
      return row1.id - row2.id
    }
    return String(row1.id).localeCompare(String(row2.id))
  }
}
