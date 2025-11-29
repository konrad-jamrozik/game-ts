import pluralize from 'pluralize'
import type { MissionSiteId } from '../model/model'
import { floor, floorToDec1, floorToDec2, toPct } from './mathUtils'

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
