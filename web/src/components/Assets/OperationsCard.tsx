import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import {
  OPERATIONS_CARD_WIDTH,
  SITUATION_REPORT_EXPANDABLE_CARD_WIDTH,
} from '../Common/widthConstants'
import { AgentsDataGrid, FinancesDataGrid } from './AssetsDataGrid'
import { CapacitiesDataGrid } from './CapacitiesDataGrid'
import { LeadsSummaryDataGrid, MissionsSummaryDataGrid } from './OperationsSummaryDataGrids'
import { CARD_GAP } from '../styling/spacing'
import { SituationReportContent } from '../SituationReportCard'

export function OperationsCard(): React.JSX.Element {
  return (
    <ExpandableCard
      id="operations"
      title="Operations"
      defaultExpanded={true}
      sx={{ width: OPERATIONS_CARD_WIDTH }}
    >
      <Stack spacing={CARD_GAP}>
        <Box sx={{ display: 'flex', gap: CARD_GAP, alignItems: 'flex-start' }}>
          <Stack spacing={CARD_GAP}>
            <AgentsDataGrid />
            <CapacitiesDataGrid />
          </Stack>
          <Stack spacing={CARD_GAP}>
            <FinancesDataGrid />
            <MissionsSummaryDataGrid />
            <LeadsSummaryDataGrid />
          </Stack>
        </Box>
        <ExpandableCard
          id="situation-report"
          title="Situation Report"
          defaultExpanded={true}
          nested={true}
          sx={{ width: SITUATION_REPORT_EXPANDABLE_CARD_WIDTH }}
        >
          <SituationReportContent />
        </ExpandableCard>
      </Stack>
    </ExpandableCard>
  )
}
