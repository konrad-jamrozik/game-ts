import type { GridRowParams } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { f6fmtPctDec2, toF } from '../lib/primitives/fixed6'
import { getFactionName, isFactionTerminated } from '../lib/model_utils/factionUtils'
import { openChartsDrilldown, openFactionsDrilldown } from '../redux/slices/selectionSlice'
import { ExpandableCard } from './Common/ExpandableCard'
import { SITUATION_REPORT_EXPANDABLE_CARD_WIDTH } from './Common/widthConstants'
import { StyledDataGrid } from './Common/StyledDataGrid'
import {
  getSituationReportNextOperationColumns,
  getSituationReportPanicColumns,
  type SituationReportNextOperationRow,
  type SituationReportPanicRow,
} from './SituationReport/getSituationReportColumns'
import { getCurrentTurnState } from '../redux/storeUtils'
import { getFactionNextOperationDisplay, getVisibleFactions } from './Factions/factionScreenUtils'
import { CARD_GAP, DATA_GRID_CELL_PADDING } from './styling/spacing'
import { clickableRowSx, combineSx } from './styling/stylePrimitives'

export function SituationReportContent(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector(getCurrentTurnState)
  const { panic, factions, leadInvestigationCounts } = gameState
  const revealAllFactionProfiles = useAppSelector((state) => state.settings.revealAllFactionProfiles)

  const panicPctStr = f6fmtPctDec2(panic)
  const panicPct = toF(panic) * 100

  const panicColumns = getSituationReportPanicColumns()
  const nextOperationColumns = getSituationReportNextOperationColumns()

  const panicRows: SituationReportPanicRow[] = [
    {
      id: 1,
      panic: panicPctStr,
      panicPct,
    },
  ]

  const discoveredFactions = getVisibleFactions(factions, leadInvestigationCounts, revealAllFactionProfiles)
  const nextOperationRows: SituationReportNextOperationRow[] = discoveredFactions.map((faction) => {
    const terminated = isFactionTerminated(faction, leadInvestigationCounts)
    return {
      id: faction.id,
      factionId: faction.id,
      factionName: getFactionName(faction),
      nextOperation: getFactionNextOperationDisplay(faction, terminated),
    }
  })

  function handleNextOperationRowClick(params: GridRowParams<SituationReportNextOperationRow>): void {
    dispatch(openFactionsDrilldown(params.row.factionId))
  }

  function handlePanicRowClick(): void {
    dispatch(openChartsDrilldown('currentTurn'))
  }

  return (
    <Box sx={{ display: 'flex', gap: CARD_GAP, alignItems: 'flex-start' }}>
      <StyledDataGrid
        rows={nextOperationRows}
        columns={nextOperationColumns}
        aria-label="Faction next operations"
        onRowClick={handleNextOperationRowClick}
        sx={clickableRowSx}
      />
      <StyledDataGrid
        rows={panicRows}
        columns={panicColumns}
        aria-label="Panic data"
        onRowClick={handlePanicRowClick}
        sx={combineSx(clickableRowSx, situationReportColorBarSx)}
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

const situationReportColorBarSx = {
  '& .situation-report-color-bar-cell': {
    padding: DATA_GRID_CELL_PADDING,
  },
}
