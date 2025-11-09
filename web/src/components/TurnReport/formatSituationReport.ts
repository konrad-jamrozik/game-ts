import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { bps } from '../../lib/model/bps'
import { calculatePanicIncrease } from '../../lib/model/ruleset/ruleset'
import {
  newValueChange,
  type FactionReport,
  type PanicBreakdown,
  type PanicReport,
} from '../../lib/model/turnReportModel'
import { fmtValueChange } from '../../lib/utils/formatUtils'
import type { TurnReportTreeViewModelProps } from './TurnReportTreeView'
import { val } from '../../lib/utils/mathUtils'

/**
 * Format situation report (panic and factions) as tree structure for MUI Tree View, for TurnReportTreeView component.
 */
export function formatSituationReport(
  panicReport: PanicReport,
  factions: readonly FactionReport[],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const panicTreeItem = formatPanicReport(panicReport)

  const factionTreeItems: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = factions.map((faction) =>
    formatFactionBreakdown(faction),
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

function formatPanicReport(panicReport: PanicReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  return {
    id: 'panic-summary',
    label: `Panic: ${fmtValueChange(panicReport.change)}`,
    chipValue: panicReport.change.delta,
    reverseMainColors: true,
    children: formatPanicBreakdown(panicReport.breakdown),
  }
}

function formatPanicBreakdown(breakdown: PanicBreakdown): TurnReportTreeViewModelProps[] {
  const rows: TurnReportTreeViewModelProps[] = []

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

function formatFactionBreakdown(faction: FactionReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  const previousPanicIncrease = calculatePanicIncrease(faction.threatLevel.previous, faction.suppression.previous)
  const currentPanicIncrease = calculatePanicIncrease(faction.threatLevel.current, faction.suppression.current)
  const panicIncreaseDelta = bps(currentPanicIncrease.value - previousPanicIncrease.value)

  // Calculate mission impacts (summed across all missions)
  const totalThreatReduction = bps(
    faction.missionImpacts.reduce((sum, impact) => sum + (impact.threatReduction?.value ?? 0), 0),
  )
  const totalSuppressionAdded = bps(
    faction.missionImpacts.reduce((sum, impact) => sum + (impact.suppressionAdded?.value ?? 0), 0),
  )

  // Build threat level children (base threat increase and mission threat reductions)
  const threatLevelChildren: TreeViewBaseItem<TurnReportTreeViewModelProps>[] = [
    {
      id: `faction-${faction.factionId}-baseThreatIncrease`,
      label: 'Base Threat Increase',
      chipValue: faction.baseThreatIncrease,
      reverseColor: true, // Threat increase is bad
    },
  ]

  if (val(totalThreatReduction) !== 0) {
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
      chipValue: faction.suppressionDecay,
      reverseColor: true, // Suppression decay is bad
    })
  }

  if (val(totalSuppressionAdded) !== 0) {
    suppressionChildren.push({
      id: `faction-${faction.factionId}-mission-suppressions`,
      label: 'Mission Suppressions',
      chipValue: totalSuppressionAdded,
      reverseColor: false, // Suppression increase is good (default)
    })
  }

  const panicCaused = newValueChange(previousPanicIncrease, currentPanicIncrease)
  return {
    id: faction.factionId,
    label: `${faction.factionName}: Panic Caused: ${fmtValueChange(panicCaused)}`,
    chipValue: panicIncreaseDelta,
    reverseMainColors: true,
    children: [
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
    ],
  }
}
