import type { DataGridProps, GridColDef } from '@mui/x-data-grid'
import theme, { CARD_CONTENT_PADDING } from '../styling/theme'
import { columnWidths } from './columnWidths'

export type ColumnWidthKey = keyof typeof columnWidths

export type DataGridWidthOptions = {
  checkboxSelection?: DataGridProps['checkboxSelection']
}

export const DATA_GRID_CHECKBOX_COLUMN_WIDTH = 50

/**
 * Extra non-column width added when sizing StyledDataGrid.
 * This is not the width of an empty grid; it is the small rendered DataGrid
 * frame/filler allowance beyond declared column widths.
 */
export const STYLED_DATA_GRID_EXTRA_WIDTH_PX = 10

export const EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX =
  2 * Number.parseFloat(theme.spacing(CARD_CONTENT_PADDING))

export const SCREEN_ACTIONS_COLUMN_WIDTH = 240

export function getColumnsWidth(columns: readonly Pick<GridColDef, 'width' | 'minWidth'>[]): number {
  return columns.reduce((total, column) => total + (column.width ?? column.minWidth ?? 0), 0)
}

export function getColumnKeysWidth(columnKeys: readonly ColumnWidthKey[]): number {
  return columnKeys.reduce((total, columnKey) => total + columnWidths[columnKey], 0)
}

export function getDataGridWidth(
  columns: readonly Pick<GridColDef, 'width' | 'minWidth'>[],
  options: DataGridWidthOptions = {},
): number {
  return STYLED_DATA_GRID_EXTRA_WIDTH_PX + getColumnsWidth(columns) + getCheckboxColumnWidth(options)
}

export function getDataGridWidthForColumnKeys(
  columnKeys: readonly ColumnWidthKey[],
  options: DataGridWidthOptions = {},
): number {
  return STYLED_DATA_GRID_EXTRA_WIDTH_PX + getColumnKeysWidth(columnKeys) + getCheckboxColumnWidth(options)
}

export function getDataGridCardWidth(
  columns: readonly Pick<GridColDef, 'width' | 'minWidth'>[],
  options: DataGridWidthOptions = {},
): number {
  return EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX + getDataGridWidth(columns, options)
}

export function getDataGridCardWidthForColumnKeys(
  columnKeys: readonly ColumnWidthKey[],
  options: DataGridWidthOptions = {},
): number {
  return EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX + getDataGridWidthForColumnKeys(columnKeys, options)
}

export function getHorizontalStackWidth(widths: readonly number[], gapPx: number): number {
  if (widths.length === 0) {
    return 0
  }
  return widths.reduce((total, width) => total + width, 0) + gapPx * (widths.length - 1)
}

function getCheckboxColumnWidth(options: DataGridWidthOptions): number {
  return options.checkboxSelection === true ? DATA_GRID_CHECKBOX_COLUMN_WIDTH : 0
}
