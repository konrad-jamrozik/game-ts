import { Box, Chip } from '@mui/material'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem, type TreeItemProps, type TreeItemSlotProps } from '@mui/x-tree-view/TreeItem'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'
import type { TreeViewBaseItem, TreeViewDefaultItemModelProperties } from '@mui/x-tree-view/models'
import * as React from 'react'
import type { Bps } from '../../lib/model/bps'
import { str } from '../../lib/utils/formatUtils'
import { val } from '../../lib/utils/mathUtils'
import theme from '../../styling/theme'

const defaultReverseMainColors = false

type TurnReportTreeViewProps = {
  items: TreeViewBaseItem<TurnReportTreeViewModelProps>[]
  defaultExpandedItems?: readonly string[]
}

// KJA this should refer to TreeItemWithLabelChipProps. And what does it even represent? Why do I need it in addition to TreeItemWithLabelChipProps?
export type TurnReportTreeViewModelProps = TreeViewDefaultItemModelProperties & {
  chipValue?: number | Bps
  /** If true, reverse color semantics: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseColor?: boolean
  /** If true, reverse color semantics for the main value change: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseMainColors?: boolean
  /** If true, always display as gray/default color regardless of value */
  noColor?: boolean
  /** If true, never display "+" sign for positive values */
  noPlusSign?: boolean
}

type TreeItemLabelWithChipProps = {
  // Note: 'children' property is required, and it denotes the plain textual label,
  // adjacent to chipLabel. Here it often is of form "previous -> current", see formatUtils.ts.
  // 'children' is required because and object of this type
  // is used by MUI as TreeItemSlotProps for 'label' slot,
  // which is SlotComponentProps<'div', {}, {}>.
  // which is React.JSX.IntrinsicElements['div'],
  // which uses 'children' to denote value of its content.
  // See about_mui.md for more.
  children: React.ReactNode
  chipLabel?: string | undefined
  reverseColor?: boolean
  reverseMainColors?: boolean
  noColor?: boolean
}

/**
 * Custom TreeView component that displays chips in TreeItem labels.
 */
export function TurnReportTreeView({ items, defaultExpandedItems }: TurnReportTreeViewProps): React.ReactElement {
  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper }}>
      <RichTreeView
        {...(defaultExpandedItems !== undefined && { defaultExpandedItems: [...defaultExpandedItems] })}
        items={items}
        slots={{ item: TurnReportTreeItem }}
      />
    </Box>
  )
}

function TurnReportTreeItem(props: TreeItemProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = useTreeItemModel<TurnReportTreeViewModelProps>(props.itemId)!

  // Format the chip label from the value
  const chipLabel = formatChipLabel(item.chipValue, item.noPlusSign ?? false)

  const valueChangeLabelProps: TreeItemLabelWithChipProps = {
    children: item.label,
    chipLabel,
    reverseColor: item.reverseColor ?? false,
    reverseMainColors: item.reverseMainColors ?? defaultReverseMainColors,
    noColor: item.noColor ?? false,
  }

  const labelSlot: React.ElementType<TreeItemLabelWithChipProps> = TreeItemLabelWithChip
  const labelSlotProps: TreeItemSlotProps = {
    label: valueChangeLabelProps,
  }

  return (
    <TreeItem
      {...props}
      slots={{
        label: labelSlot,
      }}
      slotProps={labelSlotProps}
    />
  )
}

function TreeItemLabelWithChip({
  children,
  chipLabel,
  reverseColor = false,
  reverseMainColors = false,
  noColor = false,
}: TreeItemLabelWithChipProps): React.ReactElement {
  // Determine color based on chipLabel content and reverseColor setting
  const color: 'success' | 'error' | 'default' = determineChipColor(chipLabel, noColor, reverseColor, reverseMainColors)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{children}</span>
      {chipLabel !== undefined && (
        <Chip label={chipLabel} color={color} size="small" sx={{ fontSize: '0.875rem', height: 18 }} />
      )}
    </div>
  )
}

/**
 * Formats a numeric value into a chip label string.
 */
function formatChipLabel(chipValue: number | Bps | undefined, noPlusSign: boolean): string | undefined {
  if (chipValue === undefined) {
    return undefined
  }
  const value = val(chipValue)
  const sign = noPlusSign ? '' : value > 0 ? '+' : ''
  return `${sign}${str(chipValue)}`
}

/**
 * Determines the chip color based on the label content and color settings.
 */
function determineChipColor(
  chipLabel: string | undefined,
  noColor: boolean,
  reverseColor: boolean,
  reverseMainColors: boolean,
): 'success' | 'error' | 'default' {
  if (noColor || chipLabel === undefined) {
    return 'default'
  }

  // Determine if the value is positive, negative, or zero based on the label
  const isPositive = chipLabel.startsWith('+') || (!chipLabel.startsWith('-') && chipLabel !== '0')
  const isZero = chipLabel === '0' || chipLabel === '+0'

  if (isZero) {
    return 'default'
  }

  if (reverseColor || reverseMainColors) {
    return isPositive ? 'error' : 'success'
  }
  return isPositive ? 'success' : 'error'
}
