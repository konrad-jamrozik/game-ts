import { Chip } from '@mui/material'
import * as React from 'react'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem, type TreeItemProps } from '@mui/x-tree-view/TreeItem'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'
import { fmtPctDiv100Dec2 } from '../../lib/utils/formatUtils'

export type ValueChangeTreeItemModelProps = {
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

type ValueChangeLabelProps = {
  children: string
  className: string
  value?: number
  reverseColor?: boolean
  showPercentage?: boolean
  percentageOnly?: boolean
  reverseMainColors?: boolean
}

const defaultShowPercentage = false
const defaultPercentageOnly = false
const defaultReverseMainColors = false

type TreeViewForValueChangesProps = {
  items: TreeViewBaseItem<ValueChangeTreeItemModelProps>[]
  defaultExpandedItems?: readonly string[]
}

/**
 * Custom TreeView component that displays chips in TreeItem labels.
 */
export function TreeViewForValueChanges({
  items,
  defaultExpandedItems,
}: TreeViewForValueChangesProps): React.ReactElement {
  return (
    <RichTreeView
      {...(defaultExpandedItems !== undefined && { defaultExpandedItems: [...defaultExpandedItems] })}
      items={items}
      slots={{ item: ValueChangeTreeItem }}
    />
  )
}

type ValueChangeTreeItemProps = TreeItemProps & {
  ref?: React.Ref<HTMLLIElement>
}

function ValueChangeTreeItem({ ref, ...props }: ValueChangeTreeItemProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = useTreeItemModel<ValueChangeTreeItemModelProps>(props.itemId)!

  return (
    <TreeItem
      {...props}
      ref={ref}
      slots={{
        label: ValueChangeLabel,
      }}
      slotProps={{
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        label: {
          value: item.value,
          reverseColor: item.reverseColor ?? false,
          showPercentage: item.showPercentage ?? defaultShowPercentage,
          percentageOnly: item.percentageOnly ?? defaultPercentageOnly,
          reverseMainColors: item.reverseMainColors ?? defaultReverseMainColors,
        } as ValueChangeLabelProps,
      }}
    />
  )
}

function ValueChangeLabel({
  children,
  className,
  value,
  reverseColor = false,
  showPercentage = false,
  percentageOnly: _percentageOnly = false,
  reverseMainColors = false,
}: ValueChangeLabelProps): React.ReactElement {
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
  let chipLabel: string | undefined = undefined
  if (value !== undefined) {
    const sign = value > 0 ? '+' : ''
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
