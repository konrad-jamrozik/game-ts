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
import { TurnReportTreeView, type TurnReportTreeViewModelProps } from './TurnReportTreeView'
import { bps, isBps, type Bps } from '../../lib/model/bps'

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
 * Format panic breakdown as tree structure for MUI Tree View with chips
 */
function formatPanicReportAsTreeViewItem(panicReport: PanicReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  const topLevelItem: TreeViewBaseItem<TurnReportTreeViewModelProps> = {
    id: 'panic-summary',
    label: `Panic: ${fmtValueChange(panicReport.change)}`,
    chipValue: panicReport.change.delta,
    reverseMainColors: true,
  }

  const childrenTreeItems: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = formatPanicBreakdown(
    panicReport.breakdown,
  ).map((row) => {
    const treeItem: TurnReportTreeViewModelProps = {
      id: row.id,
      label: row.label,
      chipValue: row.chipValue,
      reverseColor: row.reverseColor ?? false,
    }
    return treeItem
  })

  topLevelItem.children = childrenTreeItems
  return topLevelItem
}

/**
 * Format faction breakdown as tree structure for MUI Tree View with chips
 */
function formatFactionBreakdownAsTree(faction: FactionReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  const previousPanicIncrease = calculatePanicIncrease(faction.threatLevel.previous, faction.suppression.previous)
  const currentPanicIncrease = calculatePanicIncrease(faction.threatLevel.current, faction.suppression.current)
  const panicIncreaseDelta = bps(currentPanicIncrease.value - previousPanicIncrease.value)

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
  const threatLevelChildren: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = [
    {
      id: `faction-${faction.factionId}-baseThreatIncrease`,
      label: 'Base Threat Increase',
      chipValue: faction.baseThreatIncrease.value,
      reverseColor: true, // Threat increase is bad
    },
  ]

  if (totalThreatReduction !== 0) {
    threatLevelChildren.push({
      id: `faction-${faction.factionId}-mission-threat-reductions`,
      label: 'Mission Threat Reductions',
      chipValue: totalThreatReduction,
      reverseColor: false, // Threat reduction is good (default)
    })
  }

  // Build suppression children (mission suppressions and suppression decay)
  const suppressionChildren: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = []

  if (faction.suppressionDecay.value !== 0) {
    suppressionChildren.push({
      id: `faction-${faction.factionId}-suppressionDecay`,
      label: 'Suppression Decay',
      chipValue: faction.suppressionDecay.value,
      reverseColor: true, // Suppression decay is bad
    })
  }

  if (totalSuppressionAdded !== 0) {
    suppressionChildren.push({
      id: `faction-${faction.factionId}-mission-suppressions`,
      label: 'Mission Suppressions',
      chipValue: totalSuppressionAdded,
      reverseColor: false, // Suppression increase is good (default)
    })
  }

  // Top level children: threat level and suppression
  const children: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = [
    {
      id: `faction-${faction.factionId}-threat-level`,
      label: `Threat Level: ${fmtValueChange(faction.threatLevel)}`,
      chipValue: faction.threatLevel.delta,
      reverseMainColors: true,
      children: threatLevelChildren,
    },
    {
      id: `faction-${faction.factionId}-suppression`,
      label: `Suppression: ${fmtValueChange(faction.suppression)}`,
      chipValue: faction.suppression.delta,
      reverseColor: false, // Suppression increase is good (default)
      children: suppressionChildren,
    },
  ]

  const panicCaused = newValueChange(previousPanicIncrease, currentPanicIncrease)
  return {
    id: faction.factionId,
    label: `${faction.factionName}: Panic Caused: ${fmtValueChange(panicCaused)}`,
    chipValue: panicIncreaseDelta,
    reverseMainColors: true,
    children,
  }
}

/**
 * Format situation report (panic and factions) as tree structure for MUI Tree View
 */
function formatSituationReportAsTree(
  panicReport: PanicReport,
  factions: readonly FactionReport[],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const panicTreeItem = formatPanicReportAsTreeViewItem(panicReport)

  const factionTreeItems: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = factions.map((faction) =>
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
function formatIntelBreakdown(breakdown: IntelBreakdown): BreakdownRow[] {
  return [
    { id: 'espionageGathered', label: 'Espionage Gathered', chipValue: breakdown.espionageGathered },
    { id: 'missionRewards', label: 'Mission Rewards', chipValue: breakdown.missionRewards },
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
        chipValue: faction.factionPanicIncrease,
        reverseColor: true, // Panic increase is bad
      })
    }
  })

  // Add mission reductions (shown as negative values)
  const totalMissionReduction = bps(
    breakdown.missionReductions.reduce((sum, mission) => sum + mission.reduction.value, 0),
  )
  if (totalMissionReduction.value !== 0) {
    rows.push({
      id: 'panic-mission-reductions',
      label: 'Mission Reductions',
      chipValue: totalMissionReduction,
      reverseColor: false, // Panic reduction is good (default)
    })
  }

  return rows
}

type BreakdownRow = TreeViewDefaultItemModelProperties & {
  chipValue: number | Bps
  /** If true, reverse color semantics: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseColor?: boolean
}
