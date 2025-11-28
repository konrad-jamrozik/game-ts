import pluralize from 'pluralize'
import type { MissionSiteId, MissionSite } from '../model/model'
import { isBps, type Bps } from '../model/bps'
import type { ValueChange } from '../model/turnReportModel'
import type { RollResult } from '../turn_advancement/rolls'
import { getMissionById } from '../collections/missions'
import { div, floor, toPct } from './mathUtils'

// KJA formatUtils.ts should not depend on bps. fixed2 depends on fmtUtils and the same should be the case for bps.

export function str(value: unknown): string {
  if (isBps(value)) {
    return addPctSignDiv100Dec2(value)
  }
  if (typeof value === 'number' && value % 1 !== 0) {
    return fmtDec2(value)
  }
  return String(value)
}

/** // KJA this should be called bpsFmtPctDec2 and be in bps.ts
 * @returns The value, divided by 100, formatted as percentage with 2 decimal places.
 * For example, 12345 will be formatted as "123.45%"
 */
export function addPctSignDiv100Dec2(value: Bps): string {
  return addPctSignDiv100(value.value, 2)
}

/** // KJA2 now unused, previously was used in retreat report
 * @returns The value, multiplied by 100, formatted as percentage with 2 decimal places.
 * For example, 0.12345 will be formatted as "12.34%"
 */
export function addPctSignMult100Dec2(value: number): string {
  return addPctSign(value * 100, 2)
}

export function addPctSignDiv100(value: number, decimals: number): string {
  return addPctSign(value, decimals, 100)
}

export function addPctSignDec2(value: number): string {
  return addPctSign(value, 2, 1)
}

export function fmtPctDec0(nominator: number, denominator = 1): string {
  if (denominator === 0) {
    return '0%'
  }
  return `${fmtDec0(toPct(nominator, denominator))}%`
}

export function fmtPctDec1(nominator: number, denominator = 1): string {
  if (denominator === 0) {
    return '0.0%'
  }
  return `${fmtDec1(toPct(nominator, denominator))}%`
}

export function fmtPctDec2(nominator: number, denominator = 1): string {
  if (denominator === 0) {
    return '0.00%'
  }
  return `${fmtDec2(toPct(nominator, denominator))}%`
}

export function fmtInt(value: number): string {
  return fmtDec0(value)
}

export function fmtDec0(value: number): string {
  return floor(value).toFixed(0)
}

export function fmtDec1(value: number): string {
  return floor(value).toFixed(1)
}

/**
 * Formats a number to 2 decimal places.
 * @param value - The number to format
 * @returns Formatted string with 2 decimal places (e.g., "3.67")
 */
export function fmtDec2(value: number): string {
  return floor(value).toFixed(2)
}

// KJA note it rounds to nearest due to toFixed, not down
export function addPctSign(value: number, decimals = 0, denominator = 1): string {
  return `${div(value, denominator).toFixed(decimals)}%`
}

/**
 * Formats string by removing common prefixes
 */
export function fmtNoPrefix(id: string, prefix: string): string {
  return id.replace(new RegExp(`^${prefix}`, 'u'), '')
}

/**
 * Formats mission site target for display (removes '-site-' patterns)
 */
export function fmtMissionTarget(missionSiteId: MissionSiteId | undefined): string {
  if (missionSiteId === undefined) {
    return 'mission ?'
  }
  const displayId = missionSiteId.replaceAll('-site-', ' ')
  return ` on ${displayId}`
}

/**
 * Formats mission site ID with mission ID for display
 * @param missionSite - The mission site object
 * @returns Formatted string in the format "{siteId} ({missionId})" (e.g., "001 (001)")
 */
export function fmtMissionSiteIdWithMissionId(missionSite: MissionSite): string {
  const mission = getMissionById(missionSite.missionId)
  const missionSiteIdWithoutPrefix = fmtNoPrefix(missionSite.id, 'mission-site-')
  const missionIdWithoutPrefix = fmtNoPrefix(mission.id, 'mission-')
  return `${missionSiteIdWithoutPrefix} (${missionIdWithoutPrefix})`
}

export function fmtAgentCount(count: number): string {
  return `${count} ${pluralize('agent', count)}`
}

/**
 * Formats a value change as "previous → current"
 * @param change - The value change to format
 * @returns Formatted string in the format "previous → current"
 */
export function fmtValueChange<TNumber extends number | Bps = number>(change: ValueChange<TNumber>): string {
  return `${str(change.previous)} → ${str(change.current)}`
}

/**
 * Formats roll result information
 * @param rollResult - The roll result
 * @returns Formatted string in the format "[roll% vs threshold% threshold]"
 */
export function fmtRollResult(rollResult: RollResult): string {
  const icon = rollResult.success ? '✅' : '❌'
  const relation = rollResult.success ? '> ' : '<='
  return `[${icon} roll ${addPctSignDec2(rollResult.rollPct)} is ${relation} ${addPctSignDec2(rollResult.failureProbabilityPct)} threshold]`
}
