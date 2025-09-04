import * as React from 'react'
import { Box, Typography, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import type { TurnReport, ValueChange, MoneyBreakdown, IntelBreakdown } from '../../lib/model/reportModel'

type TurnReportTreeProps = {
  report: TurnReport
}

/**
 * Format a ValueChange as "previous → current (±delta)"
 */
function formatValueChange(change: ValueChange): string {
  const deltaSign = change.delta >= 0 ? '+' : ''
  return `${change.previous} → ${change.current} (${deltaSign}${change.delta})`
}

/**
 * Format a delta value with appropriate styling
 */
function formatDelta(delta: number): React.ReactNode {
  const color = delta > 0 ? 'success' : delta < 0 ? 'error' : 'default'
  const sign = delta >= 0 ? '+' : ''
  return <Chip label={`${sign}${delta}`} color={color} size="small" sx={{ ml: 1, fontSize: '0.75rem' }} />
}

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

type ValueChangeAccordionProps = {
  id: string
  title: string
  valueChange: ValueChange
  breakdownContent: React.ReactNode
  expanded: boolean
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void
}

/**
 * Reusable accordion component for displaying value changes with breakdowns
 */
function ValueChangeAccordion({
  id,
  title,
  valueChange,
  breakdownContent,
  expanded,
  onChange,
}: ValueChangeAccordionProps): React.ReactElement {
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${id}-content`} id={`${id}-header`}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ mr: 1 }}>
            {formatValueChange(valueChange)}
          </Typography>
          {formatDelta(valueChange.delta)}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Breakdown:
        </Typography>
        {breakdownContent}
      </AccordionDetails>
    </Accordion>
  )
}

/**
 * TreeView component for displaying turn advancement reports in split-panel layout
 */
export function TurnReportTree({ report }: TurnReportTreeProps): React.ReactElement {
  const { assets } = report
  const [expandedAccordion, setExpandedAccordion] = React.useState<string | false>(false)

  function handleTreeItemClick(accordionId: string): void {
    setExpandedAccordion(expandedAccordion === accordionId ? false : accordionId)
  }

  function handleAccordionChange(accordionId: string) {
    return (_event: React.SyntheticEvent, isExpanded: boolean): void => {
      setExpandedAccordion(isExpanded ? accordionId : false)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: 400, minWidth: 600, bgcolor: 'background.paper', borderRadius: 1 }}>
      {/* Left Panel - Tree Navigation */}
      <Box
        sx={{
          width: 250,
          mr: 2,
          borderRight: '1px solid',
          borderColor: 'divider',
          pr: 2,
          bgcolor: 'background.default',
        }}
      >
        <SimpleTreeView defaultExpandedItems={['assets']}>
          <TreeItem itemId="assets" label={<Typography variant="h6">Assets</Typography>}>
            <TreeItem
              itemId="assets-money"
              label={
                <Typography
                  variant="body1"
                  sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                  onClick={() => handleTreeItemClick('money')}
                >
                  Money
                </Typography>
              }
            />
            <TreeItem
              itemId="assets-intel"
              label={
                <Typography
                  variant="body1"
                  sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                  onClick={() => handleTreeItemClick('intel')}
                >
                  Intel
                </Typography>
              }
            />
          </TreeItem>
        </SimpleTreeView>
      </Box>

      {/* Right Panel - Collapsible Details */}
      <Box sx={{ flex: 1 }}>
        <ValueChangeAccordion
          id="money"
          title="Money"
          valueChange={assets.money}
          breakdownContent={formatMoneyBreakdown(assets.moneyDetails)}
          expanded={expandedAccordion === 'money'}
          onChange={handleAccordionChange('money')}
        />

        <ValueChangeAccordion
          id="intel"
          title="Intel"
          valueChange={assets.intel}
          breakdownContent={formatIntelBreakdown(assets.intelDetails)}
          expanded={expandedAccordion === 'intel'}
          onChange={handleAccordionChange('intel')}
        />
      </Box>
    </Box>
  )
}
