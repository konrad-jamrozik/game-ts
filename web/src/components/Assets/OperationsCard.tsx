import Box from '@mui/material/Box'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { OPERATIONS_CARD_WIDTH } from '../Common/widthConstants'
import { AgentsDataGrid, FinancesDataGrid } from './AssetsDataGrid'
import { CapacitiesDataGrid } from './CapacitiesDataGrid'
import { LeadsSummaryDataGrid, MissionsSummaryDataGrid } from './OperationsSummaryDataGrids'

export function OperationsCard(): React.JSX.Element {
  return (
    <ExpandableCard id="operations" title="Operations" defaultExpanded={true} sx={{ width: OPERATIONS_CARD_WIDTH }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'max-content max-content max-content',
          gap: 2,
          alignItems: 'start',
        }}
      >
        <AgentsDataGrid />
        <FinancesDataGrid />
        <CapacitiesDataGrid />
        <LeadsSummaryDataGrid />
        <MissionsSummaryDataGrid />
      </Box>
    </ExpandableCard>
  )
}
