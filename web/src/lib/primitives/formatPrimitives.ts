import { floor, floorToDec1, floorToDec2, floorToDec4, toPct } from './mathPrimitives'

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

export function fmtPctDec4(nominator: number, denominator = 1): string {
  if (denominator === 0) {
    return '0.0000%'
  }
  return `${fmtDec4(toPct(nominator, denominator))}%`
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
 * Formats the displayed difference between two numbers to 1 decimal place.
 *
 * The displayed difference is computed as the difference between the floored
 * display values, not the raw difference. This ensures the formatted diff
 * matches what users see when comparing the displayed current and projected values.
 *
 * Returns `undefined` when the displayed diff is 0.0 (useful for hiding a "diff" chip).
 */
export function fmtDec1Diff(prev: number, succ: number): string | undefined {
  const displayUnit = 10 // 0.1 in *10 units
  const prevDisplay = floor(prev * displayUnit)
  const succDisplay = floor(succ * displayUnit)
  const displayedDiff = succDisplay - prevDisplay

  if (displayedDiff === 0) {
    return undefined
  }

  const sign = displayedDiff < 0 ? '-' : ''
  const value = Math.abs(displayedDiff) / displayUnit
  return `${sign}${value.toFixed(1)}`
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

export function fmtDec4(value: number): string {
  return floorToDec4(value).toFixed(4)
}

// KJA1 review all usages, should be only within proper util funcs
/**
 * Formats string by removing common prefixes
 */
export function fmtNoPrefix(id: string, prefix: string): string {
  return id.replace(new RegExp(`^${prefix}`, 'u'), '')
}
