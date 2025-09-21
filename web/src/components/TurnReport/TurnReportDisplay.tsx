import { Box } from '@mui/material'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import type { IntelBreakdown, MoneyBreakdown } from '../../lib/model/reportModel'
import { ExpandableCard } from '../ExpandableCard'
import { ValueChangeCard, type BreakdownRow } from './ValueChangeCard'

/**
 * Format money breakdown details
 */
function formatMoneyBreakdown(breakdown: MoneyBreakdown): BreakdownRow[] {
  return [
    { id: 'agentUpkeep', label: 'Agent Upkeep', value: breakdown.agentUpkeep },
    { id: 'contractingEarnings', label: 'Contracting Earnings', value: breakdown.contractingEarnings },
    { id: 'fundingIncome', label: 'Funding Income', value: breakdown.fundingIncome },
    { id: 'hireCosts', label: 'Hire Costs', value: breakdown.hireCosts },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
  ].filter((item) => item.value !== 0)
}

/**
 * Format intel breakdown details
 */
function formatIntelBreakdown(breakdown: IntelBreakdown): BreakdownRow[] {
  return [
    { id: 'espionageGathered', label: 'Espionage Gathered', value: breakdown.espionageGathered },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
  ].filter((item) => item.value !== 0)
}

/**
 * TreeView component for displaying turn advancement reports in split-panel layout
 */
export function TurnReportDisplay(): React.ReactElement {
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(() => new Set())
  const report = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)

  console.log('TurnReportDisplay!')

  function handleCardChange(cardId: string) {
    return (_event: React.SyntheticEvent, isExpanded: boolean): void => {
      setExpandedCards((prevExpanded) => {
        const newExpanded = new Set(prevExpanded)
        if (isExpanded) {
          newExpanded.add(cardId)
        } else {
          newExpanded.delete(cardId)
        }
        return newExpanded
      })
    }
  }

  return (
    <ExpandableCard title="Turn Report" defaultExpanded={true}>
      {report && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr',
            gap: 2, // This adds spacing between grid items (2 is equivalent to 16px)
            // Thanks to this collapsed cards won't expand with empty space below them
            // when a sibling card on the same row is expanded.
            alignItems: 'start',
          }}
        >
          <ValueChangeCard
            id="money"
            title="Money"
            valueChange={report.assets.money}
            breakdownRows={formatMoneyBreakdown(report.assets.moneyDetails)}
            expanded={expandedCards.has('money')}
            onChange={handleCardChange('money')}
          />

          <ValueChangeCard
            id="intel"
            title="Intel"
            valueChange={report.assets.intel}
            breakdownRows={formatIntelBreakdown(report.assets.intelDetails)}
            expanded={expandedCards.has('intel')}
            onChange={handleCardChange('intel')}
          />
        </Box>
      )}
    </ExpandableCard>
  )
}
