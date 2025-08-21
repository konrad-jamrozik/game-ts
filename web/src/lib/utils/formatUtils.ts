import pluralize from 'pluralize'

export function fmtPctDiv100Dec2(value: number): string {
  return fmtPctDiv100(value, 2)
}

export function fmtPctDiv100(value: number, decimals: number): string {
  return fmtPct(value, decimals, 100)
}

export function fmtPctDec2(value: number): string {
  return fmtPct(value, 2, 1)
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
