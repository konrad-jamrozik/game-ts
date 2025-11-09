import { Box } from '@mui/material'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import { bps, isBps } from '../../lib/model/bps'
import { str } from '../../lib/utils/formatUtils'
import { ExpandableCard } from '../ExpandableCard'
import { formatAssets } from './formatAssets'
import { formatSituationReport } from './formatSituationReport'
import { TurnReportTreeView } from './TurnReportTreeView'

/**
 * CSS Grid component for displaying turn advancement reports
 */
export function TurnReportDisplay(): React.ReactElement {
  const report = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)

  console.log('TurnReportDisplay!')
  // KJA temp debug for bps
  console.log(`str: ${str(bps(100))}, isBps: ${isBps(bps(100))} | str: ${str(100)}, isBps: ${isBps(100)}`)

  const assetsDefaultExpandedItems: readonly string[] = [
    // 'money-summary',
    // 'intel-summary'
    'agents-summary',
  ]
  const situationReportDefaultExpandedItems: readonly string[] = [
    // 'panic-summary',
    'factions-summary',
    // 'faction-red-dawn',
  ]
  // Format assets report (money, intel, and agents) for tree view
  const assetsTreeData = report ? formatAssets(report.assets) : []

  // Format situation report (panic, factions, and missions) for tree view
  const situationReportTreeData = report ? formatSituationReport(report.panic, report.factions, report.missions) : []

  return (
    <ExpandableCard title="Turn Report" defaultExpanded={true}>
      {report && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'auto auto',
            gap: 2, // `gap` adds spacing between grid items (2 is equivalent to 16px)
            // Thanks to `alignItems: 'start'` each card  will only take the vertical space its content needs,
            // preventing other cards in the same row from expanding vertically.
            // Note: this is needed only if 2 or more cards are in the same row.
            alignItems: 'start',
          }}
        >
          <ExpandableCard title="Assets" defaultExpanded={true} nested={true}>
            <TurnReportTreeView items={assetsTreeData} defaultExpandedItems={assetsDefaultExpandedItems} />
          </ExpandableCard>

          <ExpandableCard title="Situation Report" defaultExpanded={true} nested={true}>
            <TurnReportTreeView
              items={situationReportTreeData}
              defaultExpandedItems={situationReportDefaultExpandedItems}
            />
          </ExpandableCard>
        </Box>
      )}
    </ExpandableCard>
  )
}
