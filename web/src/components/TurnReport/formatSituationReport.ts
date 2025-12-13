import { sum } from 'radash'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { toF6, toF, f4fmtPctDec2Diff, f6gt } from '../../lib/primitives/fixed6'
import { f6fmtValueChange } from '../../lib/model_utils/formatModelUtils'
import { getActivityLevelName, assertIsActivityLevel } from '../../lib/ruleset/activityLevelRuleset'
import type {
  ExpiredMissionSiteReport,
  FactionReport,
  MissionReport,
  PanicBreakdown,
  PanicReport,
} from '../../lib/model/turnReportModel'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { formatMissions } from './formatMissions'
import type { TurnReportTreeViewModelProps } from './TurnReportTreeView'

/**
 * Format situation report (panic, factions, and missions) as a tree structure for the MUI Tree View,
 * for the TurnReportTreeView component, to display it as part of the TurnReportCard component.
 */
export function formatSituationReport(
  panicReport: PanicReport,
  factions: readonly FactionReport[],
  missions?: readonly MissionReport[],
  expiredMissionSites?: readonly ExpiredMissionSiteReport[],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  return [
    formatPanicReport(panicReport),
    {
      id: 'factions-summary',
      label: 'Factions',
      children: factions.map((faction) => formatFactionBreakdown(faction)),
    },
    ...(missions !== undefined && missions.length > 0
      ? [
          {
            id: 'missions-summary',
            label: 'Mission sites',
            children: formatMissions(missions),
          },
        ]
      : []),
    ...(expiredMissionSites !== undefined && expiredMissionSites.length > 0
      ? [
          {
            id: 'expired-missions-summary',
            label: 'Expired Mission Sites',
            children: formatExpiredMissionSites(expiredMissionSites),
          },
        ]
      : []),
  ]
}

function formatPanicReport(panicReport: PanicReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  return {
    id: 'panic-summary',
    label: `Panic: ${f6fmtValueChange(panicReport.change)}`,
    chipValue: f4fmtPctDec2Diff(panicReport.change.previous, panicReport.change.current),
    reverseColor: true, // Panic increase is bad
    children: formatPanicBreakdown(panicReport.breakdown),
  }
}

function formatPanicBreakdown(breakdown: PanicBreakdown): TurnReportTreeViewModelProps[] {
  const totalMissionReduction = toF6(sum(breakdown.missionReductions, (mission) => toF(mission.reduction)))
  const anyMissionReductionExists = toF(totalMissionReduction) > 0

  const rows: TurnReportTreeViewModelProps[] = [
    // Faction operation penalties (from expired missions)
    ...breakdown.factionOperationPenalties
      .filter((penalty) => f6gt(penalty.panicIncrease, toF6(0)))
      .map((penalty) => ({
        id: `panic-faction-op-${penalty.factionId}`,
        label: `${penalty.factionName} operation (lvl ${penalty.operationLevel})`,
        chipValue: penalty.panicIncrease,
        reverseColor: true, // Panic increase is bad
      })),
    // Mission reductions
    ...(anyMissionReductionExists
      ? [
          {
            id: 'panic-mission-reduction',
            label: 'Mission reduction',
            chipValue: toF6(-toF(totalMissionReduction)),
            reverseColor: true, // Panic reduction is good (default)
          },
        ]
      : []),
  ]

  return rows
}

function formatFactionBreakdown(fct: FactionReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  assertIsActivityLevel(fct.activityLevel.previous)
  assertIsActivityLevel(fct.activityLevel.current)
  const prevLevelName = getActivityLevelName(fct.activityLevel.previous)
  const currLevelName = getActivityLevelName(fct.activityLevel.current)
  const levelChanged = fct.activityLevel.previous !== fct.activityLevel.current

  return {
    id: fct.factionId,
    label: `${fct.factionName}. Activity: ${currLevelName}${levelChanged ? ` (was ${prevLevelName})` : ''}`,
    chipValue: levelChanged ? 'Level up!' : undefined,
    reverseColor: true, // Activity increase is bad
    children: [
      {
        id: `faction-${fct.factionId}-activity-level`,
        label: `Activity level: ${fct.activityLevel.current} - ${currLevelName}`,
        chipValue: fct.activityLevelIncreased === true ? '+1' : undefined,
        reverseColor: true, // Activity increase is bad
      },
      {
        id: `faction-${fct.factionId}-turns-at-level`,
        label: `Turns at level: ${fct.turnsAtCurrentLevel.current}`,
        chipValue: fct.turnsAtCurrentLevel.delta !== 0 ? (fct.turnsAtCurrentLevel.delta > 0 ? '+1' : '-1') : undefined,
        noColor: true,
      },
      {
        id: `faction-${fct.factionId}-next-operation`,
        label:
          !Number.isFinite(fct.turnsUntilNextOperation.current) || fct.activityLevel.current === 0
            ? 'Next operation in: Never'
            : `Next operation in: ${fct.turnsUntilNextOperation.current} turns`,
        chipValue:
          Number.isFinite(fct.turnsUntilNextOperation.delta) && fct.turnsUntilNextOperation.delta !== 0
            ? fct.turnsUntilNextOperation.delta > 0
              ? `+${fct.turnsUntilNextOperation.delta}`
              : String(fct.turnsUntilNextOperation.delta)
            : undefined,
        reverseColor: false, // Lower is worse, but showing the number is neutral
      },
      {
        id: `faction-${fct.factionId}-suppression`,
        label: `Suppression: ${fct.suppressionTurns.current} turns`,
        chipValue:
          fct.suppressionTurns.delta !== 0
            ? fct.suppressionTurns.delta > 0
              ? `+${fct.suppressionTurns.delta}`
              : String(fct.suppressionTurns.delta)
            : undefined,
        reverseColor: false, // Suppression increase is good
        children: formatSuppressionChildren(fct.factionId, fct.missionImpacts),
      },
    ],
  }
}

function formatSuppressionChildren(
  factionId: string,
  missionImpacts: FactionReport['missionImpacts'],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const totalSuppressionAdded = sum(missionImpacts, (impact) => impact.suppressionAdded ?? 0)

  return totalSuppressionAdded !== 0
    ? [
        {
          id: `faction-${factionId}-mission-suppression`,
          label: 'Mission suppression',
          chipValue: `+${totalSuppressionAdded} turns`,
          reverseColor: false, // Suppression increase is good
        },
      ]
    : []
}

function formatExpiredMissionSites(
  expiredMissionSites: readonly ExpiredMissionSiteReport[],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  return expiredMissionSites.map((expired) => {
    const displayId = fmtNoPrefix(expired.missionSiteId, 'mission-site-')
    const children: TurnReportTreeViewModelProps[] = []

    if (expired.panicPenalty !== undefined && f6gt(expired.panicPenalty, toF6(0))) {
      children.push({
        id: `expired-mission-${expired.missionSiteId}-panic`,
        label: 'Panic penalty',
        chipValue: expired.panicPenalty,
        reverseColor: true, // Panic increase is bad
      })
    }

    if (expired.fundingPenalty !== undefined && expired.fundingPenalty > 0) {
      children.push({
        id: `expired-mission-${expired.missionSiteId}-funding`,
        label: 'Funding penalty',
        chipValue: `-${expired.fundingPenalty}`,
        reverseColor: true, // Funding decrease is bad
      })
    }

    return {
      id: `expired-mission-${expired.missionSiteId}`,
      label: `${expired.missionTitle} (id: ${displayId})`,
      chipValue: 'Expired',
      ...(children.length > 0 && { children }),
    }
  })
}
