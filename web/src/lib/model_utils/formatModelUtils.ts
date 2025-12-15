import pluralize from 'pluralize'
import { getLeadById } from '../collections/leads'
import { getMissionDefById } from '../collections/missions'
import type { LeadInvestigation } from '../model/leadModel'
import type { Mission, MissionId } from '../model/missionModel'
import { assertDefined } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
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

/**
 * Formats IDs for display with their names.
 * Accepts LeadInvestigationId, LeadId, AgentId, or MissionId.
 * - LeadInvestigationId: "005 Deep state" (numeric value + lead name)
 * - LeadId: "003 Deep state" (numeric value if present, otherwise ID without prefix + lead name)
 * - AgentId: "agent-007" (full agent ID as-is)
 * - MissionId: "007 Raid cult logistics hub" (numeric value + mission name)
 */
export function fmtForDisplay(
  id: string,
  params: {
    leadInvestigations: Record<string, LeadInvestigation>
    missions: Mission[]
  },
): string {
  if (id.startsWith('investigation-')) {
    const investigation = params.leadInvestigations[id]
    assertDefined(investigation, `Investigation not found: ${id}`)
    const lead = getLeadById(investigation.leadId)
    const numericPart = fmtNoPrefix(id, 'investigation-')
    return `${numericPart} ${lead.name}`
  }

  if (id.startsWith('mission-')) {
    const mission = params.missions.find((m) => m.id === id)
    assertDefined(mission, `Mission not found: ${id}`)
    const missionDef = getMissionDefById(mission.missionDefId)
    const numericPart = fmtNoPrefix(id, 'mission-')
    return `${numericPart} ${missionDef.name}`
  }

  if (id.startsWith('agent-')) {
    return id
  }

  // LeadId case
  const lead = getLeadById(id)
  // Try to extract numeric part from lead ID (e.g., "lead-003" -> "003")
  // If no numeric part found, use ID without prefix
  const numericMatch = /\d+/u.exec(id)
  if (numericMatch) {
    return `${numericMatch[0]} ${lead.name}`
  }
  const idWithoutPrefix = id.startsWith('lead-') ? fmtNoPrefix(id, 'lead-') : id
  return `${idWithoutPrefix} ${lead.name}`
}
