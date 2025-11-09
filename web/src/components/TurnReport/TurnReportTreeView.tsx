import { Box } from '@mui/material'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem, type TreeItemProps, type TreeItemSlotProps, type TreeItemSlots } from '@mui/x-tree-view/TreeItem'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'
import type { TreeViewBaseItem, TreeViewDefaultItemModelProperties, TreeViewItemId } from '@mui/x-tree-view/models'
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
 * Recursively collects all item IDs that have children starting from a specific item.
 * Based on the pattern from MUI TreeView documentation.
 */
function getAllChildItemIds(
  items: TreeViewBaseItem<TurnReportTreeViewModelProps>[],
  targetItemId: TreeViewItemId,
): TreeViewItemId[] {
  const itemIds: TreeViewItemId[] = []

  // Find the target item first
  function findTargetItem(
    itemsToSearch: TreeViewBaseItem<TurnReportTreeViewModelProps>[],
  ): TreeViewBaseItem<TurnReportTreeViewModelProps> | undefined {
    for (const item of itemsToSearch) {
      if (item.id === targetItemId) {
        return item
      }
      if (item.children !== undefined && item.children.length > 0) {
        const found = findTargetItem(item.children)
        if (found !== undefined) {
          return found
        }
      }
    }
    return undefined
  }

  const targetItem = findTargetItem(items)
  if (targetItem === undefined) {
    return itemIds
  }

  // Recursively register all item IDs that have children, starting from the target item's children
  function registerItemId(item: TreeViewBaseItem<TurnReportTreeViewModelProps>): void {
    if (item.children !== undefined && item.children.length > 0) {
      itemIds.push(item.id)
      for (const child of item.children) {
        registerItemId(child)
      }
    }
  }

  // Start collecting from the target item's children
  if (targetItem.children !== undefined && targetItem.children.length > 0) {
    for (const child of targetItem.children) {
      registerItemId(child)
    }
  }

  return itemIds
}

/**
 * Custom TreeView component that displays chips in TreeItem labels.
 */
export function TurnReportTreeView({ items, defaultExpandedItems }: TurnReportTreeViewProps): React.ReactElement {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(
    defaultExpandedItems !== undefined ? [...defaultExpandedItems] : [],
  )
  // Track recursive expansion to prevent override by default expansion behavior
  const recursiveExpansionRef = React.useRef<{ itemId: string; childIds: string[] } | undefined>(undefined)

  function handleExpandedItemsChange(_event: React.SyntheticEvent | null, itemIds: string[]): void {
    // If we have a pending recursive expansion, merge it instead of using the default toggle
    if (recursiveExpansionRef.current !== undefined) {
      const { itemId, childIds } = recursiveExpansionRef.current
      // Merge the recursive expansion with the incoming change
      const mergedExpandedItems = new Set([...itemIds, itemId, ...childIds])
      setExpandedItems([...mergedExpandedItems])
      // Clear the ref after handling
      recursiveExpansionRef.current = undefined
      return
    }
    setExpandedItems(itemIds)
  }

  function handleItemClick(event: React.MouseEvent, itemId: string): void {
    // Check if Ctrl key is held
    if (event.ctrlKey) {
      // Prevent default expansion behavior
      event.preventDefault()
      event.stopPropagation()

      // Get all child item IDs recursively
      const allChildIds = getAllChildItemIds(items, itemId)

      // Store the recursive expansion info for handleExpandedItemsChange to use
      recursiveExpansionRef.current = { itemId, childIds: allChildIds }

      // Expand the clicked item itself and all its children
      const newExpandedItems = new Set([...expandedItems, itemId, ...allChildIds])
      setExpandedItems([...newExpandedItems])
    }
  }

  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper }}>
      <RichTreeView
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
        items={items}
        slots={{ item: TurnReportTreeItem }}
        onItemClick={handleItemClick}
      />
    </Box>
  )
}

function TurnReportTreeItem(props: TreeItemProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = useTreeItemModel<TurnReportTreeViewModelProps>(props.itemId)!

  const labelProps: TreeItemLabelWithChipProps = {
    ...item,
    children: item.label,
  }

  const slots: TreeItemSlots = { label: TreeItemLabelWithChip }
  const labelSlotProps: TreeItemSlotProps = { label: labelProps }

  return <TreeItem {...props} slots={slots} slotProps={labelSlotProps} />
}
