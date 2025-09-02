import * as React from 'react'
import { Box, Typography, Chip } from '@mui/material'
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

/**
 * TreeView component for displaying turn advancement reports
 */
export function TurnReportTree({ report }: TurnReportTreeProps): React.ReactElement {
  const { assets } = report

  return (
    <Box sx={{ minHeight: 200, minWidth: 300 }}>
      <SimpleTreeView>
        <TreeItem
          itemId="assets"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">Assets</Typography>
            </Box>
          }
        >
          <TreeItem
            itemId="assets-money"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1">Money: {formatValueChange(assets.money)}</Typography>
                {formatDelta(assets.money.delta)}
              </Box>
            }
          >
            <TreeItem
              itemId="assets-money-details"
              label={
                <Typography variant="body2" color="text.secondary">
                  Breakdown:
                </Typography>
              }
            >
              {formatMoneyBreakdown(assets.moneyDetails)}
            </TreeItem>
          </TreeItem>

          <TreeItem
            itemId="assets-intel"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1">Intel: {formatValueChange(assets.intel)}</Typography>
                {formatDelta(assets.intel.delta)}
              </Box>
            }
          >
            <TreeItem
              itemId="assets-intel-details"
              label={
                <Typography variant="body2" color="text.secondary">
                  Breakdown:
                </Typography>
              }
            >
              {formatIntelBreakdown(assets.intelDetails)}
            </TreeItem>
          </TreeItem>
        </TreeItem>
      </SimpleTreeView>
    </Box>
  )
}
