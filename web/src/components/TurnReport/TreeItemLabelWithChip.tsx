import * as React from 'react'
import type { Bps } from '../../lib/model/bps'
import { MyChip } from '../MyChip'

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
  chipValue?: number | Bps | string | undefined
  /** If true, never display "+" sign for positive values */
  noPlusSign?: boolean
  /** If true, reverse color semantics: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseColor?: boolean
  /** If true, always display as gray/default color regardless of value */
  noColor?: boolean
  /** If true, display using warning color (orange/yellow) */
  useWarningColor?: boolean
}

export function TreeItemLabelWithChip({
  children,
  chipValue,
  noPlusSign = false,
  reverseColor = false,
  noColor = false,
  useWarningColor = false,
}: TreeItemLabelWithChipProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{children}</span>
      <MyChip chipValue={chipValue} noPlusSign={noPlusSign} reverseColor={reverseColor} noColor={noColor} useWarningColor={useWarningColor} />
    </div>
  )
}
