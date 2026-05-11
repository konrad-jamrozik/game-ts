import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { OPERATIONS_CARD_WIDTH } from '../Common/widthConstants'
import { AgentsDataGrid, FinancesDataGrid } from './AssetsDataGrid'
import { CapacitiesDataGrid } from './CapacitiesDataGrid'
import { LeadsSummaryDataGrid, MissionsSummaryDataGrid } from './OperationsSummaryDataGrids'

export function OperationsCard(): React.JSX.Element {
  return (
    <ExpandableCard id="operations" title="Operations" defaultExpanded={true} sx={{ width: OPERATIONS_CARD_WIDTH }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Stack spacing={2}>
          <AgentsDataGrid />
          <CapacitiesDataGrid />
        </Stack>
        <Stack spacing={2}>
          <FinancesDataGrid />
          <MissionsSummaryDataGrid />
          <LeadsSummaryDataGrid />
        </Stack>
      </Box>
    </ExpandableCard>
  )
}
