import pluralize from 'pluralize'
import type { MissionId } from '../model/missionModel'
import { floorToDec2 } from '../primitives/mathPrimitives'
import { isF6, type Fixed6, f6fmtPctDec2 } from '../primitives/fixed6'
import type { ValueChange } from '../model/turnReportModel'

/**
 * Formats mission target for display
 */
export function fmtMissionTarget(missionId: MissionId | undefined): string {
  if (missionId === undefined) {
    return 'mission ?'
  }
  const displayId = missionId.replaceAll('mission-', '')
  return ` on ${displayId}`
}

export function fmtAgentCount(count: number): string {
  return `${count} ${pluralize('agent', count)}`
}

/**
 * Formats a value (Fixed6 or number) as a string.
 * - Fixed6 values are formatted as percentages with 2 decimal places
 * - Numbers with decimal parts are formatted with 2 decimal places
 * - Whole numbers are formatted as plain integers
 */
export function f6str(value: number | Fixed6): string {
  if (isF6(value)) {
    return f6fmtPctDec2(value)
  }
  if (typeof value === 'number' && value % 1 !== 0) {
    return floorToDec2(value).toFixed(2)
  }
  return String(value)
}

/**
 * Formats a value change as "previous → current"
 * @param change - The value change to format
 * @returns Formatted string in the format "previous → current"
 */
export function f6fmtValueChange<TNumber extends number | Fixed6 = number>(change: ValueChange<TNumber>): string {
  return `${f6str(change.previous)} → ${f6str(change.current)}`
}
