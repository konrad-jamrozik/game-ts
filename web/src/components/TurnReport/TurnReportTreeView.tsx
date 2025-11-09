import { Box } from '@mui/material'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem, type TreeItemProps, type TreeItemSlotProps } from '@mui/x-tree-view/TreeItem'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'
import type { TreeViewBaseItem, TreeViewDefaultItemModelProperties } from '@mui/x-tree-view/models'
import * as React from 'react'
import theme from '../../styling/theme'
import { TreeItemLabelWithChip, type TreeItemLabelWithChipProps } from './TreeItemLabelWithChip'

type TurnReportTreeViewProps = {
  items: TreeViewBaseItem<TurnReportTreeViewModelProps>[]
  defaultExpandedItems?: readonly string[]
}

/**
 * TurnReportTreeViewModelProps is defined this way because:
 * 1. The main point of defining TurnReportTreeView is to enable the customized TreeItemLabelWithChip,
 * so here we are drilling the properties from TurnReportTreeViewModelProps to TreeItemLabelWithChipProps.
 * This is done via useTreeItemModel and slotProps. Refer to TurnReportTreeItem function for details.
 * 2. We must omit children because their presence is required by MUI TreeView component.
 * Refer to the comment on 'children' property in TreeItemLabelWithChipProps for details.
 *
 */
export type TurnReportTreeViewModelProps = TreeViewDefaultItemModelProperties &
  Omit<TreeItemLabelWithChipProps, 'children'>

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

  const valueChangeLabelProps: TreeItemLabelWithChipProps = {
    children: item.label,
    chipValue: item.chipValue ?? undefined,
    noPlusSign: item.noPlusSign ?? false,
    reverseColor: item.reverseColor ?? false,
    reverseMainColors: item.reverseMainColors ?? false,
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
