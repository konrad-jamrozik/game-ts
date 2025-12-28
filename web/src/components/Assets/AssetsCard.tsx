import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { RIGHT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { AssetsDataGrid } from './AssetsDataGrid'

export function AssetsCard(): React.JSX.Element {
  return (
    <ExpandableCard id="assets" title="Assets" defaultExpanded={true} sx={{ width: RIGHT_COLUMN_CARD_WIDTH }}>
      <AssetsDataGrid />
    </ExpandableCard>
  )
}
