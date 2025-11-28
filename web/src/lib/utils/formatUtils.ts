import pluralize from 'pluralize'
import type { MissionSiteId, MissionSite } from '../model/model'
import { isBps, type Bps } from '../model/bps'
import type { ValueChange } from '../model/turnReportModel'
import type { RollResult } from '../turn_advancement/rolls'
import { getMissionById } from '../collections/missions'
import { div, floor, floorToDec1, floorToDec2, toPct } from './mathUtils'
import { f4fmtPctDec2 } from '../model/fixed4'

// KJA formatUtils.ts should not depend on bps or fixed2. fixed2 depends on fmtUtils and the same should be the case for bps.

export function str(value: unknown): string {
  if (isBps(value)) {
    return f4fmtPctDec2(value)
  }
  if (typeof value === 'number' && value % 1 !== 0) {
    return fmtDec2(value)
  }
  return String(value)
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
  return floorToDec1(value).toFixed(1)
}

/**
/**
 * Formats a number to 2 decimal places, flooring at the 2nd decimal.
 * @param value - The number to format
 * @returns Formatted string with 2 decimal places (e.g., "123.456" -> "123.45")
 */
export function fmtDec2(value: number): string {
  return floorToDec2(value).toFixed(2)
}

// KJA note it rounds to nearest due to toFixed, not down. Get rid of this.
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
  // KJA bug: this now displays:
  // 🩸 👤 agent-011  (83) hits       👺 enemy-initiate-2        (40) [AC:  1]  for   8  (80%) damage [✅ roll 726400.00% is >  -812500.00% threshold] (  12 /  20  (60%) HP remaining)
  return `[${icon} roll ${f4fmtPctDec2(rollResult.rollInt)} is ${relation} ${f4fmtPctDec2(rollResult.failureInt)} threshold]`
}
