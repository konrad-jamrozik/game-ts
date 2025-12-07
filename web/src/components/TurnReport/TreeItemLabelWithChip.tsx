import * as React from 'react'
import { MyChip, type MyChipProps } from '../Common/MyChip'

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
  // Check if children contains the arrow pattern (→) indicating a value change display
  // Only process if children is a string
  let labelContent: React.ReactNode = children
  if (typeof children === 'string') {
    const arrowIndex = children.indexOf('→')
    if (arrowIndex !== -1) {
      // Find the colon before the arrow to split label from value
      // Format is "Label: previous → current", so we want "Label:" in default font
      // and "previous → current" in Courier New
      const colonIndex = children.lastIndexOf(':', arrowIndex)
      if (colonIndex !== -1) {
        const labelPart = children.slice(0, colonIndex + 1) // Include the colon
        const valuePart = children.slice(colonIndex + 1) // Value part after colon (includes space)
        labelContent = (
          <>
            <span>{labelPart}</span>
            <span style={{ fontFamily: 'Courier New' }}>{valuePart}</span>
          </>
        )
      } else {
        // Fallback: if no colon found, just split at arrow
        const labelPart = children.slice(0, arrowIndex)
        const valuePart = children.slice(arrowIndex)
        labelContent = (
          <>
            <span>{labelPart}</span>
            <span style={{ fontFamily: 'Courier New' }}>{valuePart}</span>
          </>
        )
      }
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{labelContent}</span>
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
