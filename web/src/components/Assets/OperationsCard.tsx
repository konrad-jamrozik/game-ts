import Stack from '@mui/material/Stack'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { OPERATIONS_CARD_WIDTH } from '../Common/widthConstants'
import { AssetsDataGrid } from './AssetsDataGrid'
import { CapacitiesDataGrid } from './CapacitiesDataGrid'
import { OperationsSummaryDataGrids } from './OperationsSummaryDataGrids'

export function OperationsCard(): React.JSX.Element {
  return (
    <ExpandableCard id="operations" title="Operations" defaultExpanded={true} sx={{ width: OPERATIONS_CARD_WIDTH }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <AssetsDataGrid />
          <CapacitiesDataGrid />
        </Stack>
        <OperationsSummaryDataGrids />
      </Stack>
    </ExpandableCard>
  )
}
