import { sum } from 'radash'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { toF6, toF, type Fixed6, f6sub } from '../../lib/primitives/fixed6'
import { f6fmtValueChange } from '../../lib/primitives/f6fmtUtils'
import { getPanicIncrease } from '../../lib/model/ruleset/panicRuleset'
import {
  newValueChange,
  type ExpiredMissionSiteReport,
  type FactionReport,
  type MissionReport,
  type PanicBreakdown,
  type PanicReport,
} from '../../lib/model/turnReportModel'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { formatMissions } from './formatMissions'
import type { TurnReportTreeViewModelProps } from './TurnReportTreeView'

/**
 * Format situation report (panic, factions, and missions) as a tree structure for the MUI Tree View,
 * for the TurnReportTreeView component, to display it as part of the TurnReportDisplay component.
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
            label: 'Missions',
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
    chipValue: panicReport.change.delta,
    reverseColor: true, // Panic increase is bad
    children: formatPanicBreakdown(panicReport.breakdown),
  }
}

function formatPanicBreakdown(breakdown: PanicBreakdown): TurnReportTreeViewModelProps[] {
  const totalMissionReduction = toF6(sum(breakdown.missionReductions, (mission) => toF(mission.reduction)))
  const anyMissionReductionExists = toF(totalMissionReduction) > 0

  const rows: TurnReportTreeViewModelProps[] = [
    ...breakdown.factionPanicIncreases
      .filter((faction) => toF(faction.factionPanicIncrease) !== 0)
      .map((faction) => ({
        id: `panic-faction-${faction.factionId}`,
        label: `Caused by ${faction.factionName}`,
        chipValue: faction.factionPanicIncrease,
        reverseColor: true, // Panic increase is bad
      })),
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
  const previousPanicIncrease = getPanicIncrease(fct.threatLevel.previous, fct.suppression.previous)
  const currentPanicIncrease = getPanicIncrease(fct.threatLevel.current, fct.suppression.current)
  const panicIncreaseDelta = f6sub(currentPanicIncrease, previousPanicIncrease)

  const panicIncrease = newValueChange(previousPanicIncrease, currentPanicIncrease)
  return {
    id: fct.factionId,
    label: `${fct.factionName}. Panic contrib.: ${f6fmtValueChange(panicIncrease)}`,
    chipValue: panicIncreaseDelta,
    reverseColor: true, // Panic increase is bad
    children: [
      {
        id: `faction-${fct.factionId}-threat-level`,
        label: `Threat level: ${f6fmtValueChange(fct.threatLevel)}`,
        chipValue: fct.threatLevel.delta,
        reverseColor: true, // Threat increase is bad
        children: formatThreatLevelChildren(fct.factionId, fct.baseThreatIncrease, fct.missionImpacts),
      },
      {
        id: `faction-${fct.factionId}-suppression`,
        label: `Suppression: ${f6fmtValueChange(fct.suppression)}`,
        chipValue: fct.suppression.delta,
        reverseColor: false, // Suppression increase is good (default)
        children: formatSuppressionChildren(fct.factionId, fct.suppressionDecay, fct.missionImpacts),
      },
    ],
  }
}

function formatThreatLevelChildren(
  factionId: string,
  baseThreatIncrease: Fixed6,
  missionImpacts: FactionReport['missionImpacts'],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const totalThreatReduction = toF6(
    sum(missionImpacts, (impact) => (impact.threatReduction ? toF(impact.threatReduction) : 0)),
  )

  return [
    {
      id: `faction-${factionId}-baseThreatIncrease`,
      label: 'Base threat',
      chipValue: baseThreatIncrease,
      reverseColor: true, // Threat increase is bad
    },
    ...(toF(totalThreatReduction) !== 0
      ? [
          {
            id: `faction-${factionId}-mission-threat-reductions`,
            label: 'Mission reduction',
            chipValue: toF6(-toF(totalThreatReduction)),
            reverseColor: true, // Threat reduction is good (default)
          },
        ]
      : []),
  ]
}

function formatSuppressionChildren(
  factionId: string,
  suppressionDecay: Fixed6,
  missionImpacts: FactionReport['missionImpacts'],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const totalSuppressionAdded = toF6(
    sum(missionImpacts, (impact) => (impact.suppressionAdded ? toF(impact.suppressionAdded) : 0)),
  )

  return [
    ...(toF(suppressionDecay) !== 0
      ? [
          {
            id: `faction-${factionId}-suppressionDecay`,
            label: 'Suppression decay',
            chipValue: toF6(-toF(suppressionDecay)),
          },
        ]
      : []),
    ...(toF(totalSuppressionAdded) !== 0
      ? [
          {
            id: `faction-${factionId}-mission-suppression`,
            label: 'Mission suppression',
            chipValue: totalSuppressionAdded,
            reverseColor: false, // Suppression increase is good (default)
          },
        ]
      : []),
  ]
}

function formatExpiredMissionSites(
  expiredMissionSites: readonly ExpiredMissionSiteReport[],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  return expiredMissionSites.map((expired) => {
    const displayId = fmtNoPrefix(expired.missionSiteId, 'mission-site-')
    return {
      id: `expired-mission-${expired.missionSiteId}`,
      label: `${expired.missionTitle} (id: ${displayId})`,
      chipValue: 'Expired',
    }
  })
}
