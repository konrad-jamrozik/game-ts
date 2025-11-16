import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { bps, type Bps } from '../../lib/model/bps'
import { calculatePanicIncrease } from '../../lib/model/ruleset/ruleset'
import {
  newValueChange,
  type ExpiredMissionSiteReport,
  type FactionReport,
  type MissionReport,
  type PanicBreakdown,
  type PanicReport,
} from '../../lib/model/turnReportModel'
import { fmtNoPrefix, fmtValueChange } from '../../lib/utils/formatUtils'
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
    label: `Panic: ${fmtValueChange(panicReport.change)}`,
    chipValue: panicReport.change.delta,
    reverseColor: true, // Panic increase is bad
    children: formatPanicBreakdown(panicReport.breakdown),
  }
}

function formatPanicBreakdown(breakdown: PanicBreakdown): TurnReportTreeViewModelProps[] {
  const totalMissionReduction = bps(
    breakdown.missionReductions.reduce((sum, mission) => sum + mission.reduction.value, 0),
  )
  const anyMissionReductionExists = totalMissionReduction.value > 0

  const rows: TurnReportTreeViewModelProps[] = [
    ...breakdown.factionPanicIncreases
      .filter((faction) => faction.factionPanicIncrease.value !== 0)
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
            chipValue: bps(-totalMissionReduction.value),
            reverseColor: true, // Panic reduction is good (default)
          },
        ]
      : []),
  ]

  return rows
}

function formatFactionBreakdown(fct: FactionReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  const previousPanicIncrease = calculatePanicIncrease(fct.threatLevel.previous, fct.suppression.previous)
  const currentPanicIncrease = calculatePanicIncrease(fct.threatLevel.current, fct.suppression.current)
  const panicIncreaseDelta = bps(currentPanicIncrease.value - previousPanicIncrease.value)

  const panicIncrease = newValueChange(previousPanicIncrease, currentPanicIncrease)
  return {
    id: fct.factionId,
    label: `${fct.factionName}. Panic contrib.: ${fmtValueChange(panicIncrease)}`,
    chipValue: panicIncreaseDelta,
    reverseColor: true, // Panic increase is bad
    children: [
      {
        id: `faction-${fct.factionId}-threat-level`,
        label: `Threat level: ${fmtValueChange(fct.threatLevel)}`,
        chipValue: fct.threatLevel.delta,
        reverseColor: true, // Threat increase is bad
        children: formatThreatLevelChildren(fct.factionId, fct.baseThreatIncrease, fct.missionImpacts),
      },
      {
        id: `faction-${fct.factionId}-suppression`,
        label: `Suppression: ${fmtValueChange(fct.suppression)}`,
        chipValue: fct.suppression.delta,
        reverseColor: false, // Suppression increase is good (default)
        children: formatSuppressionChildren(fct.factionId, fct.suppressionDecay, fct.missionImpacts),
      },
    ],
  }
}

function formatThreatLevelChildren(
  factionId: string,
  baseThreatIncrease: Bps,
  missionImpacts: FactionReport['missionImpacts'],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const totalThreatReduction = bps(
    missionImpacts.reduce((sum, impact) => sum + (impact.threatReduction?.value ?? 0), 0),
  )

  return [
    {
      id: `faction-${factionId}-baseThreatIncrease`,
      label: 'Base threat',
      chipValue: baseThreatIncrease,
      reverseColor: true, // Threat increase is bad
    },
    ...(totalThreatReduction.value !== 0
      ? [
          {
            id: `faction-${factionId}-mission-threat-reductions`,
            label: 'Mission reduction',
            chipValue: bps(-totalThreatReduction.value),
            reverseColor: true, // Threat reduction is good (default)
          },
        ]
      : []),
  ]
}

function formatSuppressionChildren(
  factionId: string,
  suppressionDecay: Bps,
  missionImpacts: FactionReport['missionImpacts'],
): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  const totalSuppressionAdded = bps(
    missionImpacts.reduce((sum, impact) => sum + (impact.suppressionAdded?.value ?? 0), 0),
  )

  return [
    ...(suppressionDecay.value !== 0
      ? [
          {
            id: `faction-${factionId}-suppressionDecay`,
            label: 'Suppression decay',
            chipValue: bps(-suppressionDecay.value),
          },
        ]
      : []),
    ...(totalSuppressionAdded.value !== 0
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
