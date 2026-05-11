import Box from '@mui/material/Box'
import * as React from 'react'
import { useAppSelector } from '../redux/hooks'
import { f6fmtPctDec2, toF } from '../lib/primitives/fixed6'
import { getFactionName, isFactionTerminated } from '../lib/model_utils/factionUtils'
import { ExpandableCard } from './Common/ExpandableCard'
import { SITUATION_REPORT_EXPANDABLE_CARD_WIDTH } from './Common/widthConstants'
import { StyledDataGrid } from './Common/StyledDataGrid'
import { columnWidths } from './Common/columnWidths'
import { getSituationReportColumns, type SituationReportRow } from './SituationReport/getSituationReportColumns'
import { getCurrentTurnState } from '../redux/storeUtils'
import { getFactionNextOperationDisplay, getVisibleFactions } from './Factions/factionScreenUtils'
import { CARD_GAP, DATA_GRID_CELL_PADDING } from './styling/spacing'

export function SituationReportContent(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
  const { panic, factions, leadInvestigationCounts } = gameState
  const revealAllFactionProfiles = useAppSelector((state) => state.settings.revealAllFactionProfiles)

  const panicPctStr = f6fmtPctDec2(panic)
  const panicPct = toF(panic) * 100

  const panicColumns = getSituationReportColumns({
    valueHeaderName: 'Panic',
    hideMetricColumn: true,
  })
  const nextOperationColumns = getSituationReportColumns({
    metricHeaderName: 'Next operation',
    valueHeaderName: 'Turns',
    metricWidth: columnWidths['situation_report.next_operations.metric'],
    valueWidth: columnWidths['situation_report.next_operations.turns'],
  })

  const panicRows: SituationReportRow[] = [
    {
      id: 1,
      metric: 'Panic',
      value: panicPctStr,
      reverseColor: true,
      panicPct,
    },
  ]

  const discoveredFactions = getVisibleFactions(factions, leadInvestigationCounts, revealAllFactionProfiles)
  const nextOperationRows: SituationReportRow[] = discoveredFactions.map((faction, index) => {
    const terminated = isFactionTerminated(faction, leadInvestigationCounts)
    return {
      id: index + 1,
      metric: getFactionName(faction),
      value: getFactionNextOperationDisplay(faction, terminated),
    }
  })

  return (
    <Box sx={{ display: 'flex', gap: CARD_GAP, alignItems: 'flex-start' }}>
      <StyledDataGrid rows={nextOperationRows} columns={nextOperationColumns} aria-label="Faction next operations" />
      <StyledDataGrid
        rows={panicRows}
        columns={panicColumns}
        aria-label="Panic data"
        sx={{
          '& .situation-report-color-bar-cell': {
            padding: DATA_GRID_CELL_PADDING,
          },
        }}
      />
    </Box>
  )
}

export function SituationReportCard(): React.JSX.Element {
  return (
    <ExpandableCard
      id="situation-report"
      title="Situation Report"
      defaultExpanded={true}
      sx={{ width: SITUATION_REPORT_EXPANDABLE_CARD_WIDTH, alignSelf: 'flex-start' }}
    >
      <SituationReportContent />
    </ExpandableCard>
  )
}
