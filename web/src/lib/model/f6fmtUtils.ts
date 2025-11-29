import type { RollResult } from '../turn_advancement/rolls'
import { floorToDec2 } from '../utils/mathUtils'
import type { ValueChange } from './turnReportModel'
import { f6fmtPctDec2, isF6, type Fixed6 } from './fixed6'

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

/**
 * Formats roll result information
 * @param rollResult - The roll result
 * @returns Formatted string in the format "[roll% vs threshold% threshold]"
 */
export function f6fmtRollResult(rollResult: RollResult): string {
  const icon = rollResult.success ? '✅' : '❌'
  const relation = rollResult.success ? '> ' : '<='
  return `[${icon} roll ${f6fmtPctDec2(rollResult.rollInt)} is ${relation} ${f6fmtPctDec2(rollResult.failureInt)} threshold]`
}
