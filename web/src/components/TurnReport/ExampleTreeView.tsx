/**
 * Adapted from MUIs "LabelSlot" example:
 * https://mui.com/x/react-tree-view/tree-item-customization/#label
 */
import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem, type TreeItemProps, type TreeItemSlotProps } from '@mui/x-tree-view/TreeItem'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'

type TreeItemWithLabel = {
  id: string
  label: string
  secondaryLabel?: string
}

type CustomTreeItemProps = TreeItemProps & {
  ref?: React.Ref<HTMLLIElement>
}

type CustomLabelProps = {
  children: string
  secondaryLabel: string
}

const MUI_X_PRODUCTS: TreeViewBaseItem<TreeItemWithLabel>[] = [
  {
    id: 'grid',
    label: 'Data Grid',
    children: [
      {
        id: 'grid-community',
        label: '@mui/x-data-grid',
        secondaryLabel: 'Community package',
      },
      {
        id: 'grid-pro',
        label: '@mui/x-data-grid-pro',
        secondaryLabel: 'Pro package',
      },
      {
        id: 'grid-premium',
        label: '@mui/x-data-grid-premium',
        secondaryLabel: 'Premium package',
      },
    ],
  },
  {
    id: 'pickers',
    label: 'Date and Time pickers',

    children: [
      {
        id: 'pickers-community',
        label: '@mui/x-date-pickers',
        secondaryLabel: 'Community package',
      },
      {
        id: 'pickers-pro',
        label: '@mui/x-date-pickers-pro',
        secondaryLabel: 'Pro package',
      },
    ],
  },
  {
    id: 'charts',
    label: 'Charts',
    children: [{ id: 'charts-community', label: '@mui/x-charts' }],
  },
  {
    id: 'tree-view',
    label: 'Tree View',
    children: [{ id: 'tree-view-community', label: '@mui/x-tree-view' }],
  },
]

export default function ExampleTreeView(): React.ReactElement {
  return (
    <Box sx={{ minHeight: 200, minWidth: 350 }}>
      <RichTreeView defaultExpandedItems={['pickers']} items={MUI_X_PRODUCTS} slots={{ item: CustomTreeItem }} />
    </Box>
  )
}

function CustomTreeItem({ ref, ...props }: CustomTreeItemProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = useTreeItemModel<TreeItemWithLabel>(props.itemId)!

  const customLabelProps: CustomLabelProps = {
    children: item.label,
    secondaryLabel: (item.secondaryLabel ?? '') || '',
  }

  const treeItemSlotProps: TreeItemSlotProps = {
    label: customLabelProps,
  }

  return (
    <TreeItem
      {...props}
      ref={ref}
      slots={{
        label: CustomLabel,
      }}
      slotProps={treeItemSlotProps}
    />
  )
}

function CustomLabel({ children, secondaryLabel }: CustomLabelProps): React.ReactElement {
  return (
    <div>
      <Typography>{children}</Typography>
      {secondaryLabel && (
        <Typography variant="caption" color="secondary">
          {secondaryLabel}
        </Typography>
      )}
    </div>
  )
}
