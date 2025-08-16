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
 * Formats string by removing common prefixes
 */
export function fmtNoPrefix(id: string, prefix: string): string {
  return id.replace(new RegExp(`^${prefix}`, 'u'), '')
}

/**
 * Formats mission site target for display (removes '-site-' patterns)
 */
export function fmtMissionTarget(missionSiteId: string): string {
  if (!missionSiteId) {
    return 'mission ?'
  }
  const displayId = missionSiteId.replaceAll('-site-', ' ')
  return ` on ${displayId}`
}

export function fmtAgentCount(count: number): string {
  return `${count} ${pluralize('agent', count)}`
}
