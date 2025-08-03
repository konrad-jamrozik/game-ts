/**
 * Utility functions for consistent formatting across the application
 */

/**
 * Formats a value as a percentage with specified decimal places
 */
export function formatAsPercentage(value: number, decimals = 2): string {
  return `${(value / 100).toFixed(decimals)}%`
}

/**
 * Formats panic value as percentage (panic is stored as value * 100)
 */
export function formatPanicPercentage(panic: number): string {
  return formatAsPercentage(panic, 2)
}

/**
 * Formats faction threat/suppression values as percentages
 */
export function formatFactionPercentage(value: number): string {
  return formatAsPercentage(value, 2)
}

/**
 * Formats suppression decay percentage
 */
export function formatSuppressionDecayPercentage(decayPercent: number): string {
  return `${decayPercent}% per turn`
}

/**
 * Formats display ID by removing common prefixes
 */
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
