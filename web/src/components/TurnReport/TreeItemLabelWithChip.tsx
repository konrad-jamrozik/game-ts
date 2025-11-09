import * as React from 'react'
import { MyChip, type MyChipProps } from '../MyChip'

export type TreeItemLabelWithChipProps = MyChipProps & {
  // Note: 'children' property is required, and it denotes the plain textual label,
  // adjacent to chipLabel. Here it often is of form "previous -> current", see formatUtils.ts.
  // 'children' is required because and object of this type
  // is used by MUI as TreeItemSlotProps for 'label' slot,
  // which is SlotComponentProps<'div', {}, {}>.
  // which is React.JSX.IntrinsicElements['div'],
  // which uses 'children' to denote value of its content.
  // See about_mui.md for more.
  children: React.ReactNode
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
      {chipValue !== undefined && (
        <MyChip
          chipValue={chipValue}
          noPlusSign={noPlusSign}
          reverseColor={reverseColor}
          noColor={noColor}
          useWarningColor={useWarningColor}
        />
      )}
    </div>
  )
}
