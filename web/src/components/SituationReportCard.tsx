import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppSelector } from '../redux/hooks'
import { f6fmtPctDec2, toF } from '../lib/primitives/fixed6'
import { getFactionName, isFactionTerminated } from '../lib/model_utils/factionUtils'
import { ExpandableCard } from './Common/ExpandableCard'
import { SITUATION_REPORT_EXPANDABLE_CARD_WIDTH } from './Common/widthConstants'
import { StyledDataGrid } from './Common/StyledDataGrid'
import { getSituationReportColumns, type SituationReportRow } from './SituationReport/getSituationReportColumns'
import { getCurrentTurnState } from '../redux/storeUtils'
import { getFactionNextOperationDisplay, getVisibleFactions } from './Factions/factionScreenUtils'
import { DATA_GRID_CELL_PADDING, SECTION_GAP } from './styling/spacing'

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
  const { panic, factions, leadInvestigationCounts } = gameState
  const revealAllFactionProfiles = useAppSelector((state) => state.settings.revealAllFactionProfiles)

  const panicPctStr = f6fmtPctDec2(panic)
  const panicPct = toF(panic) * 100

  const panicColumns = getSituationReportColumns()
  const nextOperationColumns = getSituationReportColumns({
    metricHeaderName: 'Next operation',
    valueHeaderName: 'Turns',
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
    <ExpandableCard
      id="situation-report"
      title="Situation Report"
      defaultExpanded={true}
      sx={{ width: SITUATION_REPORT_EXPANDABLE_CARD_WIDTH, alignSelf: 'flex-start' }}
    >
      <Stack spacing={SECTION_GAP}>
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
        <StyledDataGrid
          rows={nextOperationRows}
          columns={nextOperationColumns}
          aria-label="Faction next operations"
        />
      </Stack>
    </ExpandableCard>
  )
}
