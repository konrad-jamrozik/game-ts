import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { UPGRADES_CARD_WIDTH } from '../Common/widthConstants'
import { UpgradesDataGrid } from './UpgradesDataGrid'

export function UpgradesCard(): React.JSX.Element {
  return (
    <ExpandableCard id="upgrades" title="Upgrades" defaultExpanded={true} sx={{ width: UPGRADES_CARD_WIDTH }}>
      <UpgradesDataGrid />
    </ExpandableCard>
  )
}
