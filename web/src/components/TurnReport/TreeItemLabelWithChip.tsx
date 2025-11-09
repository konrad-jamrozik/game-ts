import { Chip } from '@mui/material'
import * as React from 'react'
import type { Bps } from '../../lib/model/bps'
import { val } from '../../lib/utils/mathUtils'
import { str } from '../../lib/utils/formatUtils'

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
  chipValue: number | Bps | undefined
  noPlusSign?: boolean
  reverseColor?: boolean
  reverseMainColors?: boolean
  noColor?: boolean
}

export function TreeItemLabelWithChip({
  children,
  chipValue,
  noPlusSign = false,
  reverseColor = false,
  reverseMainColors = false,
  noColor = false,
}: TreeItemLabelWithChipProps): React.ReactElement {
  // Format the chip label from the value
  const chipLabel = formatChipLabel(chipValue, noPlusSign)

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
function formatChipLabel(chipValue: number | Bps | undefined, noPlusSign?: boolean): string | undefined {
  if (chipValue === undefined) {
    return undefined
  }
  const value = val(chipValue)
  const sign = (noPlusSign ?? false) ? '' : value > 0 ? '+' : ''
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
