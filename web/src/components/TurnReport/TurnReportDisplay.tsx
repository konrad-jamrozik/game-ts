import { Box, Typography } from '@mui/material'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import type { IntelBreakdown, MoneyBreakdown } from '../../lib/model/reportModel'
import { ExpandableCard } from '../ExpandableCard'
import { ValueChangeAccordion } from './ValueChangeAccordion'

/**
 * Format money breakdown details
 */
function formatMoneyBreakdown(breakdown: MoneyBreakdown): React.ReactNode {
  const items = [
    { id: 'agentUpkeep', label: 'Agent Upkeep', value: breakdown.agentUpkeep },
    { id: 'contractingEarnings', label: 'Contracting Earnings', value: breakdown.contractingEarnings },
    { id: 'fundingIncome', label: 'Funding Income', value: breakdown.fundingIncome },
    { id: 'hireCosts', label: 'Hire Costs', value: breakdown.hireCosts },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
  ].filter((item) => item.value !== 0)

  return (
    <Box sx={{ pl: 2 }}>
      {items.map((item) => (
        <Typography key={item.id} variant="body2" sx={{ mb: 0.5 }}>
          {item.label}: {item.value >= 0 ? '+' : ''}
          {item.value}
        </Typography>
      ))}
    </Box>
  )
}

/**
 * Format intel breakdown details
 */
function formatIntelBreakdown(breakdown: IntelBreakdown): React.ReactNode {
  const items = [
    { id: 'espionageGathered', label: 'Espionage Gathered', value: breakdown.espionageGathered },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
  ].filter((item) => item.value !== 0)

  return (
    <Box sx={{ pl: 2 }}>
      {items.map((item) => (
        <Typography key={item.id} variant="body2" sx={{ mb: 0.5 }}>
          {item.label}: {item.value >= 0 ? '+' : ''}
          {item.value}
        </Typography>
      ))}
    </Box>
  )
}

/**
 * TreeView component for displaying turn advancement reports in split-panel layout
 */
export function TurnReportDisplay(): React.ReactElement {
  const [expandedAccordion, setExpandedAccordion] = React.useState<string | false>(false)
  const report = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)

  console.log('TurnReportDisplay!')

  function handleAccordionChange(accordionId: string) {
    return (_event: React.SyntheticEvent, isExpanded: boolean): void => {
      setExpandedAccordion(isExpanded ? accordionId : false)
    }
  }

  return (
    <ExpandableCard title="Turn Report" defaultExpanded={true}>
      {report && (
        <Box sx={{ display: 'flex', minHeight: 400, minWidth: 600, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Box sx={{ flex: 1 }}>
            <ValueChangeAccordion
              id="money"
              title="Money"
              valueChange={report.assets.money}
              breakdownContent={formatMoneyBreakdown(report.assets.moneyDetails)}
              expanded={expandedAccordion === 'money'}
              onChange={handleAccordionChange('money')}
            />

            <ValueChangeAccordion
              id="intel"
              title="Intel"
              valueChange={report.assets.intel}
              breakdownContent={formatIntelBreakdown(report.assets.intelDetails)}
              expanded={expandedAccordion === 'intel'}
              onChange={handleAccordionChange('intel')}
            />
          </Box>
        </Box>
      )}
    </ExpandableCard>
  )
}
