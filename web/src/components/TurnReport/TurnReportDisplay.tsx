import { Box } from '@mui/material'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import { bps, isBps } from '../../lib/model/bps'
import type { AgentsReport, IntelBreakdown, MoneyBreakdown, ValueChange } from '../../lib/model/turnReportModel'
import { fmtValueChange, str } from '../../lib/utils/formatUtils'
import { ExpandableCard } from '../ExpandableCard'
import { formatSituationReport } from './formatSituationReport'
import { TurnReportTreeView, type TurnReportTreeViewModelProps } from './TurnReportTreeView'

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
  // Format money and intel breakdowns for tree view
  const assetsTreeData = report
    ? [
        ...formatMoneyBreakdownAsTree(report.assets.moneyChange, report.assets.moneyBreakdown),
        ...formatIntelBreakdownAsTree(report.assets.intelChange, report.assets.intelBreakdown),
        ...formatAgentsBreakdownAsTree(report.assets.agentsReport),
      ]
    : []

  // Format situation report (panic and factions) for tree view
  const situationReportTreeData = report ? formatSituationReport(report.panic, report.factions) : []

  return (
    <ExpandableCard title="Turn Report" defaultExpanded={true}>
      {report && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'auto auto',
            gap: 2, // `gap` adds spacing between grid items (2 is equivalent to 16px)
            // Thanks to `alignItems: 'start'` each row will only take the space its content needs,
            // preventing other rows from expanding when a card in one row is expanded.
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

/**
 * Format money breakdown as tree structure for MUI Tree View with chips
 */
function formatMoneyBreakdownAsTree(
  moneyChange: ValueChange,
  moneyBreakdown: MoneyBreakdown,
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const treeItems: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = formatMoneyBreakdown(moneyBreakdown).map(
    (row) => {
      const item: TurnReportTreeViewModelProps = {
        id: row.id,
        label: row.label,
        chipValue: row.chipValue,
        reverseColor: row.reverseColor ?? false,
      }
      return item
    },
  )

  return [
    {
      id: 'money-summary',
      label: `Money: ${fmtValueChange(moneyChange)}`,
      chipValue: moneyChange.delta,
      children: treeItems,
    },
  ]
}

/**
 * Format intel breakdown as tree structure for MUI Tree View with chips
 */
function formatIntelBreakdownAsTree(
  intelChange: ValueChange,
  intelBreakdown: IntelBreakdown,
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const treeItems: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = formatIntelBreakdown(intelBreakdown).map(
    (row) => {
      const item: TurnReportTreeViewModelProps = {
        id: `intel-${row.id}`,
        label: row.label,
        chipValue: row.chipValue,
        reverseColor: row.reverseColor ?? false,
      }
      return item
    },
  )

  return [
    {
      id: 'intel-summary',
      label: `Intel: ${fmtValueChange(intelChange)}`,
      chipValue: intelChange.delta,
      children: treeItems,
    },
  ]
}

/**
 * Format agents breakdown as tree structure for MUI Tree View with chips
 */
function formatAgentsBreakdownAsTree(agentsReport: AgentsReport): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const { total, available, inTransit, recovering, wounded, unscathed, terminated } = agentsReport

  const treeItems: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = [
    {
      id: 'agents-total',
      label: `Total: ${fmtValueChange(total)}`,
      chipValue: total.delta,
    },
    {
      id: 'agents-available',
      label: `Available: ${fmtValueChange(available)}`,
      chipValue: available.delta,
    },
    {
      id: 'agents-in-transit',
      label: `In transit: ${fmtValueChange(inTransit)}`,
      chipValue: inTransit.delta,
      noColor: true,
    },
    {
      id: 'agents-recovering',
      label: `Recovering: ${fmtValueChange(recovering)}`,
      chipValue: recovering.delta,
      reverseColor: true,
    },
    {
      id: 'agents-unscathed',
      label: 'Unscathed',
      chipValue: unscathed.delta,
      noPlusSign: true,
    },
    {
      id: 'agents-wounded',
      label: 'Wounded',
      chipValue: wounded.delta,
      reverseColor: true,
      noPlusSign: true,
    },
    {
      id: 'agents-terminated',
      label: 'Terminated',
      chipValue: terminated.delta,
      reverseColor: true,
      noPlusSign: true,
    },
  ]

  return [
    {
      id: 'agents-summary',
      label: 'Agents',
      children: treeItems,
    },
  ]
}

/**
 * Format money breakdown details
 */
function formatMoneyBreakdown(breakdown: MoneyBreakdown): TurnReportTreeViewModelProps[] {
  return [
    { id: 'fundingIncome', label: 'Funding Income', chipValue: breakdown.fundingIncome },
    { id: 'contractingEarnings', label: 'Contracting Earnings', chipValue: breakdown.contractingEarnings },
    { id: 'missionRewards', label: 'Mission Rewards', chipValue: breakdown.missionRewards },
    { id: 'agentUpkeep', label: 'Agent Upkeep', chipValue: breakdown.agentUpkeep },
    { id: 'hireCosts', label: 'Hire Costs', chipValue: breakdown.hireCosts },
  ]
}

/**
 * Format intel breakdown details
 */
function formatIntelBreakdown(breakdown: IntelBreakdown): TurnReportTreeViewModelProps[] {
  return [
    { id: 'espionageGathered', label: 'Espionage Gathered', chipValue: breakdown.espionageGathered },
    { id: 'missionRewards', label: 'Mission Rewards', chipValue: breakdown.missionRewards },
  ]
}
