import type { DataGridProps, GridColDef } from '@mui/x-data-grid'
import theme from '../styling/theme'
import { CARD_CONTENT_PADDING } from '../styling/spacing'
import { columnWidths } from './columnWidths'

export type ColumnWidthKey = keyof typeof columnWidths

export type DataGridWidthOptions = {
  checkboxSelection?: DataGridProps['checkboxSelection']
}

export const DATA_GRID_CHECKBOX_COLUMN_WIDTH = 50

/**
 * Extra non-column width added when sizing StyledDataGrid.
 * This includes the rendered DataGrid frame/filler allowance plus the vertical
 * scrollbar gutter, so tall grids do not also get a tiny horizontal scrollbar.
 */
export const STYLED_DATA_GRID_EXTRA_WIDTH_PX = 18

export const EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX = 2 * getSpacingPx(CARD_CONTENT_PADDING)

export const SCREEN_ACTIONS_COLUMN_WIDTH = 312

/** Minimum width for the full-screen agents roster grid toolbar filter row. */
export const AGENTS_ROSTER_TOOLBAR_MIN_WIDTH_PX = 1100

export function getSpacingPx(spacing: number): number {
  return Number.parseFloat(theme.spacing(spacing))
}

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
