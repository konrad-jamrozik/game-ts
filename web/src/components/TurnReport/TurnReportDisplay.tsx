import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import type { IntelBreakdown, MoneyBreakdown, ValueChange } from '../../lib/model/reportModel'

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
    <Accordion expanded={expanded} onChange={onChange} disableGutters>
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
export function TurnReportDisplay(): React.ReactElement {
  const [expanded, setExpanded] = React.useState(true)
  const [expandedAccordion, setExpandedAccordion] = React.useState<string | false>(false)
  const report = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)

  console.log('TurnReportDisplay!')

  function handleAccordionChange(accordionId: string) {
    return (_event: React.SyntheticEvent, isExpanded: boolean): void => {
      setExpandedAccordion(isExpanded ? accordionId : false)
    }
  }

  function handleExpandClick(): void {
    setExpanded(!expanded)
  }

  return (
    <Card>
      <CardHeader
        avatar={
          <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        title={`Turn Report`}
        slotProps={{ title: { variant: 'h5' } }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
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
        </CardContent>
      </Collapse>
    </Card>
  )
}
