import pluralize from 'pluralize'
import type { MissionSiteId } from '../model/model'
import type { ValueChange } from '../model/reportModel'
import { div } from './mathUtils'

/**
 * @param value - The value to format
 * @returns The value, divided by 100, formatted as percentage with 2 decimal places. 
   For example, 12345 will be formatted as "123.45%"
 */
export function fmtPctDiv100Dec2(value: number): string {
  return fmtPctDiv100(value, 2)
}

export function fmtPctDiv100(value: number, decimals: number): string {
  return fmtPct(value, decimals, 100)
}

export function fmtPctDec2(value: number): string {
  return fmtPct(value, 2, 1)
}

export function fmtPct(value: number, decimals = 0, denominator = 1): string {
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
 * @param formatter - Optional formatter function to apply to both values
 * @returns Formatted string in the format "previous → current"
 */
export function formatValueChange(change: ValueChange, formatter?: (value: number) => string): string {
  const prev = formatter ? formatter(change.previous) : change.previous.toString()
  const curr = formatter ? formatter(change.current) : change.current.toString()
  return `${prev} → ${curr}`
}
