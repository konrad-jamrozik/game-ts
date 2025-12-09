import type { GridSortCellParams } from '@mui/x-data-grid'
import { f6cmp, f6eq, type Fixed6 } from '../../lib/primitives/fixed6'
import { assertDefined, assertHasId } from '../../lib/primitives/assertPrimitives'

/**
 * Creates a sort comparator for Fixed6 skill columns in DataGrid.
 * Finds rows by ID and compares Fixed6 values, with optional secondary sorter and fallback to row ID for stable sorting.
 *
 * @param rows - Array of all rows in the DataGrid
 * @param getValue - Function to extract the Fixed6 value from a row (primary sort)
 * @param getSecondaryValue - Optional function to extract a secondary Fixed6 value for sorting when primary values are equal
 * @param getId - Optional function to extract the row ID from a row. Defaults to `(row) => row.id` when T has an id property
 * @returns A sort comparator function for use in GridColDef.sortComparator
 */
export function createFixed6SortComparator<T>(
  rows: T[],
  getValue: (row: T) => Fixed6,
  getSecondaryValue?: (row: T) => Fixed6,
  getId?: (row: T) => number | string,
): (_v1: unknown, _v2: unknown, param1: GridSortCellParams<unknown>, param2: GridSortCellParams<unknown>) => number {
  return (
    _v1: unknown,
    _v2: unknown,
    param1: GridSortCellParams<unknown>,
    param2: GridSortCellParams<unknown>,
  ): number => {
    // Find the rows from our typed rows array using the row IDs
    const getIdFn: (row: T) => number | string = getId ?? getRowId
    const row1 = rows.find((row) => getIdFn(row) === param1.id)
    const row2 = rows.find((row) => getIdFn(row) === param2.id)

    assertDefined(row1, `Row not found for id: ${param1.id}`)
    assertDefined(row2, `Row not found for id: ${param2.id}`)

    const value1 = getValue(row1)
    const value2 = getValue(row2)

    // Primary sort: Fixed6 value comparison
    if (!f6eq(value1, value2)) {
      return f6cmp(value1, value2)
    }

    // Secondary sort: optional secondary Fixed6 value comparison
    if (getSecondaryValue !== undefined) {
      const secondaryValue1 = getSecondaryValue(row1)
      const secondaryValue2 = getSecondaryValue(row2)
      if (!f6eq(secondaryValue1, secondaryValue2)) {
        return f6cmp(secondaryValue1, secondaryValue2)
      }
    }

    // Tertiary sort: row ID (for stable sorting)
    const id1 = getIdFn(row1)
    const id2 = getIdFn(row2)
    if (typeof id1 === 'string' && typeof id2 === 'string') {
      return id1.localeCompare(id2)
    }
    if (typeof id1 === 'number' && typeof id2 === 'number') {
      return id1 - id2
    }
    return String(id1).localeCompare(String(id2))
  }
}

function getRowId(row: unknown): number | string {
  assertHasId(row)
  return row.id
}
