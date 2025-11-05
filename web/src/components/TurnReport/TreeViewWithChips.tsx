import { Chip } from '@mui/material'
import * as React from 'react'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem, type TreeItemProps } from '@mui/x-tree-view/TreeItem'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'
import { fmtPctDiv100Dec2 } from '../../lib/utils/formatUtils'

export type TreeItemWithValue = {
  id: string
  label: string
  value?: number
  /** If true, reverse color semantics: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseColor?: boolean
  /** Show percentage change instead of absolute values */
  showPercentage?: boolean
  /** When showPercentage is true, show only percentage values (hide integer values) */
  percentageOnly?: boolean
  /** If true, reverse color semantics for the main value change: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseMainColors?: boolean
}

type TreeViewWithChipsProps = {
  items: TreeViewBaseItem<TreeItemWithValue>[]
  defaultExpandedItems?: readonly string[]
  /** Default showPercentage for all items */
  defaultShowPercentage?: boolean
  /** Default percentageOnly for all items */
  defaultPercentageOnly?: boolean
  /** Default reverseMainColors for all items */
  defaultReverseMainColors?: boolean
}

type CustomTreeItemProps = TreeItemProps & {
  ref?: React.Ref<HTMLLIElement>
}

type CustomLabelProps = {
  children: string
  className: string
  value?: number
  reverseColor?: boolean
  showPercentage?: boolean
  percentageOnly?: boolean
  reverseMainColors?: boolean
}

type TreeViewDefaultsContextType = {
  defaultShowPercentage: boolean
  defaultPercentageOnly: boolean
  defaultReverseMainColors: boolean
}

const TreeViewDefaultsContext = React.createContext<TreeViewDefaultsContextType>({
  defaultShowPercentage: false,
  defaultPercentageOnly: false,
  defaultReverseMainColors: false,
})

/**
 * Custom TreeView component that displays chips for values similar to ValueChangeCard
 */
export function TreeViewWithChips({
  items,
  defaultExpandedItems,
  defaultShowPercentage = false,
  defaultPercentageOnly = false,
  defaultReverseMainColors = false,
}: TreeViewWithChipsProps): React.ReactElement {
  return (
    <TreeViewDefaultsContext.Provider
      value={{
        defaultShowPercentage,
        defaultPercentageOnly,
        defaultReverseMainColors,
      }}
    >
      <RichTreeView
        {...(defaultExpandedItems !== undefined && { defaultExpandedItems: [...defaultExpandedItems] })}
        items={items}
        slots={{ item: CustomTreeItem }}
      />
    </TreeViewDefaultsContext.Provider>
  )
}

function CustomTreeItem({ ref, ...props }: CustomTreeItemProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = useTreeItemModel<TreeItemWithValue>(props.itemId)!
  const defaults = React.useContext(TreeViewDefaultsContext)

  const showPercentage = item.showPercentage ?? defaults.defaultShowPercentage
  const percentageOnly = item.percentageOnly ?? defaults.defaultPercentageOnly
  const reverseMainColors = item.reverseMainColors ?? defaults.defaultReverseMainColors
  const reverseColor = item.reverseColor ?? false

  return (
    <TreeItem
      {...props}
      ref={ref}
      slots={{
        label: CustomLabel,
      }}
      slotProps={{
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        label: {
          value: item.value,
          reverseColor,
          showPercentage,
          percentageOnly,
          reverseMainColors,
        } as CustomLabelProps,
      }}
    />
  )
}

function CustomLabel({
  children,
  className,
  value,
  reverseColor = false,
  showPercentage = false,
  percentageOnly: _percentageOnly = false,
  reverseMainColors = false,
}: CustomLabelProps): React.ReactElement {
  // Determine color based on value and reverseColor setting
  const color: 'success' | 'error' | 'default' =
    value === undefined || value === 0
      ? 'default'
      : reverseColor || reverseMainColors
        ? value > 0
          ? 'error'
          : 'success'
        : value > 0
          ? 'success'
          : 'error'

  // Format the value display
  let chipLabel: string | undefined
  if (value !== undefined) {
    const sign = value >= 0 ? '+' : ''
    chipLabel = showPercentage ? fmtPctDiv100Dec2(value) : `${sign}${value}`
  }

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{children}</span>
      {chipLabel !== undefined && (
        <Chip label={chipLabel} color={color} size="small" sx={{ fontSize: '0.875rem', height: 18 }} />
      )}
    </div>
  )
}
