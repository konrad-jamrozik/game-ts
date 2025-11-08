import { Box } from '@mui/material'
import type { TreeViewBaseItem, TreeViewDefaultItemModelProperties } from '@mui/x-tree-view/models'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import {
  newValueChange,
  type AgentsReport,
  type FactionReport,
  type IntelBreakdown,
  type MoneyBreakdown,
  type PanicBreakdown,
  type PanicReport,
  type ValueChange,
} from '../../lib/model/reportModel'
import { calculatePanicIncrease } from '../../lib/model/ruleset/ruleset'
import { fmtValueChange, str } from '../../lib/utils/formatUtils'
import { ExpandableCard } from '../ExpandableCard'
import { TurnReportTreeView, type ValueChangeTreeItemModelProps } from './TurnReportTreeView'
import { bps, isBps } from '../../lib/model/bps'
import ExampleTreeView from './ExampleTreeView'

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
  const situationReportTreeData = report ? formatSituationReportAsTree(report.panic, report.factions) : []

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
          <ExampleTreeView />
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
): TreeViewBaseItem<ValueChangeTreeItemModelProps>[] {
  const treeItems: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = formatMoneyBreakdown(moneyBreakdown).map(
    (row) => {
      const item: ValueChangeTreeItemModelProps = {
        id: row.id,
        label: row.label,
        value: row.value,
        reverseColor: row.reverseColor ?? false,
      }
      return item
    },
  )

  return [
    {
      id: 'money-summary',
      label: `Money: ${fmtValueChange(moneyChange)}`,
      value: moneyChange.delta,
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
): TreeViewBaseItem<ValueChangeTreeItemModelProps>[] {
  const treeItems: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = formatIntelBreakdown(intelBreakdown).map(
    (row) => {
      const item: ValueChangeTreeItemModelProps = {
        id: `intel-${row.id}`,
        label: row.label,
        value: row.value,
        reverseColor: row.reverseColor ?? false,
      }
      return item
    },
  )

  return [
    {
      id: 'intel-summary',
      label: `Intel: ${fmtValueChange(intelChange)}`,
      value: intelChange.delta,
      children: treeItems,
    },
  ]
}

/**
 * Format agents breakdown as tree structure for MUI Tree View with chips
 */
function formatAgentsBreakdownAsTree(agentsReport: AgentsReport): TreeViewBaseItem<ValueChangeTreeItemModelProps>[] {
  const { total, available, inTransit, recovering, wounded, unscathed, terminated } = agentsReport

  const treeItems: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = [
    {
      id: 'agents-total',
      label: `Total: ${fmtValueChange(total)}`,
      value: total.delta,
    },
    {
      id: 'agents-available',
      label: `Available: ${fmtValueChange(available)}`,
      value: available.delta,
    },
    {
      id: 'agents-in-transit',
      label: `In transit: ${fmtValueChange(inTransit)}`,
      value: inTransit.delta,
      noColor: true,
    },
    {
      id: 'agents-recovering',
      label: `Recovering: ${fmtValueChange(recovering)}`,
      value: recovering.delta,
      reverseColor: true,
    },
    {
      id: 'agents-unscathed',
      label: 'Unscathed',
      value: unscathed.delta,
      noPlusSign: true,
    },
    {
      id: 'agents-wounded',
      label: 'Wounded',
      value: wounded.delta,
      reverseColor: true,
      noPlusSign: true,
    },
    {
      id: 'agents-terminated',
      label: 'Terminated',
      value: terminated.delta,
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
 * Format panic breakdown as tree structure for MUI Tree View with chips
 */
function formatPanicReportAsTreeViewItem(panicReport: PanicReport): TreeViewBaseItem<ValueChangeTreeItemModelProps> {
  const topLevelItem: TreeViewBaseItem<ValueChangeTreeItemModelProps> = {
    id: 'panic-summary',
    label: `Panic: ${fmtValueChange(panicReport.change)}`,
    value: panicReport.change.delta.value,
    reverseMainColors: true,
    showPercentage: true,
  }

  const childrenTreeItems: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = formatPanicBreakdown(
    panicReport.breakdown,
  ).map((row) => {
    const treeItem: ValueChangeTreeItemModelProps = {
      id: row.id,
      label: row.label,
      value: row.value,
      reverseColor: row.reverseColor ?? false,
      showPercentage: true,
    }
    return treeItem
  })

  topLevelItem.children = childrenTreeItems
  return topLevelItem
}

/**
 * Format faction breakdown as tree structure for MUI Tree View with chips
 */
function formatFactionBreakdownAsTree(faction: FactionReport): TreeViewBaseItem<ValueChangeTreeItemModelProps> {
  const previousPanicIncrease = calculatePanicIncrease(faction.threatLevel.previous, faction.suppression.previous)
  const currentPanicIncrease = calculatePanicIncrease(faction.threatLevel.current, faction.suppression.current)
  const panicIncreaseDelta = currentPanicIncrease.value - previousPanicIncrease.value

  // Calculate mission impacts (summed across all missions)
  const totalThreatReduction = faction.missionImpacts.reduce(
    (sum, impact) => sum + (impact.threatReduction?.value ?? 0),
    0,
  )
  const totalSuppressionAdded = faction.missionImpacts.reduce(
    (sum, impact) => sum + (impact.suppressionAdded?.value ?? 0),
    0,
  )

  // Build threat level children (base threat increase and mission threat reductions)
  const threatLevelChildren: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = [
    {
      id: `faction-${faction.factionId}-baseThreatIncrease`,
      label: 'Base Threat Increase',
      value: faction.baseThreatIncrease.value,
      reverseColor: true, // Threat increase is bad
      showPercentage: true,
    },
  ]

  if (totalThreatReduction !== 0) {
    threatLevelChildren.push({
      id: `faction-${faction.factionId}-mission-threat-reductions`,
      label: 'Mission Threat Reductions',
      value: totalThreatReduction,
      reverseColor: false, // Threat reduction is good (default)
      showPercentage: true,
    })
  }

  // Build suppression children (mission suppressions and suppression decay)
  const suppressionChildren: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = []

  if (faction.suppressionDecay.value !== 0) {
    suppressionChildren.push({
      id: `faction-${faction.factionId}-suppressionDecay`,
      label: 'Suppression Decay',
      value: faction.suppressionDecay.value,
      reverseColor: true, // Suppression decay is bad
      showPercentage: true,
    })
  }

  if (totalSuppressionAdded !== 0) {
    suppressionChildren.push({
      id: `faction-${faction.factionId}-mission-suppressions`,
      label: 'Mission Suppressions',
      value: totalSuppressionAdded,
      reverseColor: false, // Suppression increase is good (default)
      showPercentage: true,
    })
  }

  // Top level children: threat level and suppression
  const children: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = [
    {
      id: `faction-${faction.factionId}-threat-level`,
      label: `Threat Level: ${fmtValueChange(faction.threatLevel)}`,
      value: faction.threatLevel.delta.value,
      reverseMainColors: true,
      showPercentage: true,
      children: threatLevelChildren,
    },
    {
      id: `faction-${faction.factionId}-suppression`,
      label: `Suppression: ${fmtValueChange(faction.suppression)}`,
      value: faction.suppression.delta.value,
      reverseColor: false, // Suppression increase is good (default)
      showPercentage: true,
      children: suppressionChildren,
    },
  ]

  const panicCaused = newValueChange(previousPanicIncrease, currentPanicIncrease)
  return {
    id: faction.factionId,
    label: `${faction.factionName}: Panic Caused: ${fmtValueChange(panicCaused)}`,
    value: panicIncreaseDelta,
    reverseMainColors: true,
    showPercentage: true,
    children,
  }
}

/**
 * Format situation report (panic and factions) as tree structure for MUI Tree View
 */
function formatSituationReportAsTree(
  panicReport: PanicReport,
  factions: readonly FactionReport[],
): TreeViewBaseItem<ValueChangeTreeItemModelProps>[] {
  const panicTreeItem = formatPanicReportAsTreeViewItem(panicReport)

  const factionTreeItems: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = factions.map((faction) =>
    formatFactionBreakdownAsTree(faction),
  )

  return [
    panicTreeItem,
    {
      id: 'factions-summary',
      label: 'Factions',
      children: factionTreeItems,
    },
  ]
}

/**
 * Format money breakdown details
 */
function formatMoneyBreakdown(breakdown: MoneyBreakdown): BreakdownRow[] {
  return [
    { id: 'fundingIncome', label: 'Funding Income', value: breakdown.fundingIncome },
    { id: 'contractingEarnings', label: 'Contracting Earnings', value: breakdown.contractingEarnings },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
    { id: 'agentUpkeep', label: 'Agent Upkeep', value: breakdown.agentUpkeep },
    { id: 'hireCosts', label: 'Hire Costs', value: breakdown.hireCosts },
  ]
}

/**
 * Format intel breakdown details
 */
function formatIntelBreakdown(breakdown: IntelBreakdown): BreakdownRow[] {
  return [
    { id: 'espionageGathered', label: 'Espionage Gathered', value: breakdown.espionageGathered },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
  ]
}

/**
 * Format panic breakdown details
 */
function formatPanicBreakdown(breakdown: PanicBreakdown): BreakdownRow[] {
  const rows: BreakdownRow[] = []

  // Add faction contributions
  breakdown.factionPanicIncreases.forEach((faction) => {
    if (faction.factionPanicIncrease.value !== 0) {
      rows.push({
        id: `panic-faction-${faction.factionId}`,
        label: `Caused by ${faction.factionName}`,
        value: faction.factionPanicIncrease.value,
        reverseColor: true, // Panic increase is bad
      })
    }
  })

  // Add mission reductions (shown as negative values)
  const totalMissionReduction = breakdown.missionReductions.reduce((sum, mission) => sum + mission.reduction.value, 0)
  if (totalMissionReduction !== 0) {
    rows.push({
      id: 'panic-mission-reductions',
      label: 'Mission Reductions',
      value: totalMissionReduction,
      reverseColor: false, // Panic reduction is good (default)
    })
  }

  return rows
}

type BreakdownRow = TreeViewDefaultItemModelProperties & {
  value: number
  /** If true, reverse color semantics: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseColor?: boolean
}
