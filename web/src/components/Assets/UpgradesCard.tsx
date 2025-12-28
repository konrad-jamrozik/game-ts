import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { RIGHT_COLUMN_CARD_WIDTH } from '../Common/widthConstants'
import { UpgradesDataGrid } from './UpgradesDataGrid'

export function UpgradesCard(): React.JSX.Element {
  return (
    <ExpandableCard id="upgrades" title="Upgrades" defaultExpanded={true} sx={{ width: RIGHT_COLUMN_CARD_WIDTH }}>
      <UpgradesDataGrid />
    </ExpandableCard>
  )
}
