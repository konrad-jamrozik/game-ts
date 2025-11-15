import pluralize from 'pluralize'
import type { MissionSiteId } from '../model/model'
import { isBps, type Bps } from '../model/bps'
import type { ValueChange } from '../model/turnReportModel'
import { div } from './mathUtils'

export function str(value: unknown): string {
  if (isBps(value)) {
    return addPctSignDiv100Dec2(value)
  }
  if (typeof value === 'number' && value % 1 !== 0) {
    return fmtDec2(value)
  }
  return String(value)
}
/**
 * @returns The value, divided by 100, formatted as percentage with 2 decimal places.
 * For example, 12345 will be formatted as "123.45%"
 */
export function addPctSignDiv100Dec2(value: Bps): string {
  return addPctSignDiv100(value.value, 2)
}

export function addPctSignDiv100(value: number, decimals: number): string {
  return addPctSign(value, decimals, 100)
}

export function addPctSignDec2(value: number): string {
  return addPctSign(value, 2, 1)
}

/**
 * Formats a number to 2 decimal places.
 * @param value - The number to format
 * @returns Formatted string with 2 decimal places (e.g., "3.67")
 */
export function fmtDec2(value: number): string {
  return value.toFixed(2)
}

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
