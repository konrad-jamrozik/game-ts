import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { OPERATIONS_CAPACITIES_CARD_WIDTH } from '../Common/widthConstants'
import { CapacitiesDataGrid } from './CapacitiesDataGrid'

export function CapacitiesCard(): React.JSX.Element {
  return (
    <ExpandableCard
      id="capacities"
      title="Capacities"
      defaultExpanded={true}
      sx={{ width: OPERATIONS_CAPACITIES_CARD_WIDTH }}
    >
      <CapacitiesDataGrid />
    </ExpandableCard>
  )
}
