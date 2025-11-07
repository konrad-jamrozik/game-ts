import { Box } from '@mui/material'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import type {
  AgentsReport,
  FactionReport,
  IntelBreakdown,
  MoneyBreakdown,
  PanicBreakdown,
  PanicReport,
  ValueChange,
} from '../../lib/model/reportModel'
import { fmtPctDiv100Dec2 } from '../../lib/utils/formatUtils'
import { calculatePanicIncrease } from '../../lib/utils/factionUtils'
import { ExpandableCard } from '../ExpandableCard'
import { TurnReportTreeView, type ValueChangeTreeItemModelProps } from './TurnReportTreeView'
import type { BreakdownRow } from './ValueChangeCard'

/**
 * CSS Grid component for displaying turn advancement reports
 */
export function TurnReportDisplay(): React.ReactElement {
  const report = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)

  console.log('TurnReportDisplay!')

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
      label: `Money: ${moneyChange.previous} → ${moneyChange.current}`,
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
      label: `Intel: ${intelChange.previous} → ${intelChange.current}`,
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
      label: `Total: ${total.previous} → ${total.current}`,
      value: total.delta,
    },
    {
      id: 'agents-available',
      label: `Available: ${available.previous} → ${available.current}`,
      value: available.delta,
    },
    {
      id: 'agents-in-transit',
      label: `In transit: ${inTransit.previous} → ${inTransit.current}`,
      value: inTransit.delta,
      noColor: true,
    },
    {
      id: 'agents-recovering',
      label: `Recovering: ${recovering.previous} → ${recovering.current}`,
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
function formatPanicBreakdownAsTree(panicReport: PanicReport): TreeViewBaseItem<ValueChangeTreeItemModelProps> {
  const treeItems: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = formatPanicBreakdown(panicReport.breakdown).map(
    (row) => {
      const item: ValueChangeTreeItemModelProps = {
        id: `panic-${row.id}`,
        label: row.label,
        value: row.value,
        reverseColor: row.reverseColor ?? false,
        showPercentage: true,
      }
      return item
    },
  )

  return {
    id: 'panic-summary',
    label: `Panic: ${fmtPctDiv100Dec2(panicReport.change.previous)} → ${fmtPctDiv100Dec2(panicReport.change.current)}`,
    value: panicReport.change.delta,
    reverseMainColors: true,
    showPercentage: true,
    children: treeItems,
  }
}

/**
 * Format faction breakdown as tree structure for MUI Tree View with chips
 */
function formatFactionBreakdownAsTree(faction: FactionReport): TreeViewBaseItem<ValueChangeTreeItemModelProps> {
  const previousPanicIncrease = calculatePanicIncrease(faction.threatLevel.previous, faction.suppression.previous)
  const currentPanicIncrease = calculatePanicIncrease(faction.threatLevel.current, faction.suppression.current)
  const panicIncreaseDelta = currentPanicIncrease - previousPanicIncrease

  const children: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = [
    {
      id: `faction-${faction.factionId}-baseThreatIncrease`,
      label: 'Base Threat Increase',
      value: faction.baseThreatIncrease,
      reverseColor: true, // Threat increase is bad
      showPercentage: true,
    },
    {
      id: `faction-${faction.factionId}-panic-increase`,
      label: `Panic increase: ${fmtPctDiv100Dec2(previousPanicIncrease)} → ${fmtPctDiv100Dec2(currentPanicIncrease)}`,
      value: panicIncreaseDelta,
      reverseColor: true, // Panic increase is bad
      showPercentage: true,
    },
    {
      id: `faction-${faction.factionId}-suppression`,
      label: `Suppression: ${fmtPctDiv100Dec2(faction.suppression.previous)} → ${fmtPctDiv100Dec2(faction.suppression.current)}`,
      value: faction.suppression.delta,
      reverseColor: false, // Suppression increase is good (default)
      showPercentage: true,
    },
  ]

  // Add mission impacts (summed across all missions)
  const totalThreatReduction = faction.missionImpacts.reduce((sum, impact) => sum + (impact.threatReduction ?? 0), 0)
  const totalSuppressionAdded = faction.missionImpacts.reduce((sum, impact) => sum + (impact.suppressionAdded ?? 0), 0)

  if (totalThreatReduction !== 0) {
    children.push({
      id: `faction-${faction.factionId}-mission-threat-reductions`,
      label: 'Mission Threat Reductions',
      value: totalThreatReduction,
      reverseColor: false, // Threat reduction is good (default)
      showPercentage: true,
    })
  }

  if (totalSuppressionAdded !== 0) {
    children.push({
      id: `faction-${faction.factionId}-mission-suppressions`,
      label: 'Mission Suppressions',
      value: totalSuppressionAdded,
      reverseColor: false, // Suppression increase is good (default)
      showPercentage: true,
    })
  }

  // Add suppression decay
  if (faction.suppressionDecay !== 0) {
    children.push({
      id: `faction-${faction.factionId}-suppressionDecay`,
      label: 'Suppression Decay',
      value: faction.suppressionDecay,
      reverseColor: true, // Suppression decay is bad
      showPercentage: true,
    })
  }

  return {
    id: faction.factionId,
    label: `${faction.factionName}: Threat Level: ${fmtPctDiv100Dec2(faction.threatLevel.previous)} → ${fmtPctDiv100Dec2(faction.threatLevel.current)}`,
    value: faction.threatLevel.delta,
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
  const panicTreeItem = formatPanicBreakdownAsTree(panicReport)

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
    if (faction.factionPanicIncrease !== 0) {
      rows.push({
        id: `faction-${faction.factionId}`,
        label: `Caused by ${faction.factionName}`,
        value: faction.factionPanicIncrease,
        reverseColor: true, // Panic increase is bad
      })
    }
  })

  // Add mission reductions (shown as negative values)
  const totalMissionReduction = breakdown.missionReductions.reduce((sum, mission) => sum + mission.reduction, 0)
  if (totalMissionReduction !== 0) {
    rows.push({
      id: 'mission-reductions',
      label: 'Mission Reductions',
      value: totalMissionReduction,
      reverseColor: false, // Panic reduction is good (default)
    })
  }

  return rows
}

/**
 * Shorten mission titles for display in breakdown tables
 */
function shortenMissionTitle(title: string): string {
  // Remove common prefixes and make titles more concise
  return title
    .replaceAll(/^mission:\s*/giu, '')
    .replaceAll(/^raid\s+/giu, '')
    .replaceAll(/^apprehend\s+/giu, 'Capture ')
    .replaceAll(/red dawn\s+/giu, 'RD ')
    .replaceAll(/\s+safehouse$/giu, ' Safe')
    .replaceAll(/\s+outpost$/giu, ' Out')
    .replaceAll(/\s+base$/giu, ' Base')
    .replaceAll(/\s+hq$/giu, ' HQ')
}
