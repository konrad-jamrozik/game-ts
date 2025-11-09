import { Chip } from '@mui/material'
import * as React from 'react'

export type TreeItemLabelWithChipProps = {
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

export function TreeItemLabelWithChip({
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
