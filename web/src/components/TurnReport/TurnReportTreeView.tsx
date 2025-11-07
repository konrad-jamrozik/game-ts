import { Chip, Box } from '@mui/material'
import * as React from 'react'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem, type TreeItemProps } from '@mui/x-tree-view/TreeItem'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'
import { str } from '../../lib/utils/formatUtils'
import theme from '../../styling/theme'

export type ValueChangeTreeItemModelProps = {
  id: string
  label: string
  value?: number
  /** If true, reverse color semantics: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseColor?: boolean
  /** Show percentage change instead of absolute values */
  showPercentage?: boolean
  /** If true, reverse color semantics for the main value change: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseMainColors?: boolean
  /** If true, always display as gray/default color regardless of value */
  noColor?: boolean
  /** If true, never display "+" sign for positive values */
  noPlusSign?: boolean
}

type ValueChangeLabelProps = {
  children: string
  className: string
  value?: number
  reverseColor?: boolean
  showPercentage?: boolean
  reverseMainColors?: boolean
  noColor?: boolean
  noPlusSign?: boolean
}

const defaultShowPercentage = false
const defaultReverseMainColors = false

type TreeViewForValueChangesProps = {
  items: TreeViewBaseItem<ValueChangeTreeItemModelProps>[]
  defaultExpandedItems?: readonly string[]
}

/**
 * Custom TreeView component that displays chips in TreeItem labels.
 */
export function TurnReportTreeView({ items, defaultExpandedItems }: TreeViewForValueChangesProps): React.ReactElement {
  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper }}>
      <RichTreeView
        {...(defaultExpandedItems !== undefined && { defaultExpandedItems: [...defaultExpandedItems] })}
        items={items}
        slots={{ item: ValueChangeTreeItem }}
      />
    </Box>
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
          reverseMainColors: item.reverseMainColors ?? defaultReverseMainColors,
          noColor: item.noColor ?? false,
          noPlusSign: item.noPlusSign ?? false,
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
  reverseMainColors = false,
  noColor = false,
  noPlusSign = false,
}: ValueChangeLabelProps): React.ReactElement {
  // Determine color based on value and reverseColor setting
  const color: 'success' | 'error' | 'default' =
    noColor || value === undefined || value === 0
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
    const sign = noPlusSign ? '' : value > 0 ? '+' : ''
    // KJA fix squiggly
    chipLabel = showPercentage ? str(value) : `${sign}${value}`
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
