import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { CAPACITIES_CARD_WIDTH } from '../Common/widthConstants'
import { CapacitiesDataGrid } from './CapacitiesDataGrid'

export function CapacitiesCard(): React.JSX.Element {
  return (
    <ExpandableCard id="capacities" title="Capacities" defaultExpanded={true} sx={{ width: CAPACITIES_CARD_WIDTH }}>
      <CapacitiesDataGrid />
    </ExpandableCard>
  )
}
