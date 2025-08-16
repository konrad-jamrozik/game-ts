import pluralize from 'pluralize'

/**
 * Formats a value as a percentage with specified decimal places
 */
export function fmtPctDiv100(value: number, decimals = 2): string {
  return fmtPct(value, decimals, 100)
}

export function fmtPct(value: number, decimals = 0, div = 1): string {
  return `${(value / div).toFixed(decimals)}%`
}

/**
 * Formats panic value as percentage (panic is stored as value * 100)
 */
// KJA actually use this function
export function formatPanicPercentage(panic: number): string {
  return fmtPctDiv100(panic, 2)
}

/**
 * Formats faction threat/suppression values as percentages
 */
// KJA actually use this function
export function formatFactionPercentage(value: number): string {
  return fmtPctDiv100(value, 2)
}

/**
 * Formats suppression decay percentage
 */
// KJA actually use this function
export function formatSuppressionDecayPercentage(decayPercent: number): string {
  return `${decayPercent}% per turn`
}

/**
 * Formats display ID by removing common prefixes
 */
// KJA actually use this function
export function formatDisplayId(id: string, prefix = 'mission-site-'): string {
  return id.replace(new RegExp(`^${prefix}`, 'u'), '')
}

/**
 * Formats mission site target for display (removes '-site-' patterns)
 */
export function formatMissionTarget(missionSiteId: string): string {
  if (!missionSiteId) {
    return 'mission ?'
  }
  const displayId = missionSiteId.replaceAll('-site-', ' ')
  return ` on ${displayId}`
}

export function formatAgentCount(count: number): string {
  return `${count} ${pluralize('agent', count)}`
}
