import pluralize from 'pluralize'
import { getLeadById, getLeadInvestigationById } from '../collections/leads'
import { getMissionById, getMissionDefById } from '../collections/missions'
import type { LeadId, LeadInvestigationId } from '../model/leadModel'
import type { MissionDefId, MissionId } from '../model/missionModel'
import type { FactionId } from '../model/factionModel'
import type { AgentId } from '../model/agentModel'
import { assertDefined, assertUnreachable } from '../primitives/assertPrimitives'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import { floorToDec2 } from '../primitives/mathPrimitives'
import { isF6, type Fixed6, f6fmtPctDec2 } from '../primitives/fixed6'
import type { ValueChange } from '../model/turnReportModel'
import type { GameState } from '../model/gameStateModel'
import { assertIsFactionId, assertIsLeadId, assertIsLeadInvestigationId, assertIsMissionId } from './assertModelUtils'
import { getFactionById } from '../collections/factions'

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
 * And then, if any other info needs to be pulled up, it should be using getLeadById() etc. functions.
 * Formats IDs for display with their names.
 * Accepts LeadInvestigationId, LeadId, AgentId, or MissionId.
 * - LeadInvestigationId: "005 Deep state" (numeric value + lead name)
 * - LeadId: "003 Deep state" (numeric value if present, otherwise ID without prefix + lead name)
 * - AgentId: "agent-007" (full agent ID as-is)
 * - MissionId: "007 Raid cult logistics hub" (numeric value + mission name)
 */
export function fmtForDisplay(
  id: FactionId | LeadId | LeadInvestigationId | MissionId | MissionDefId | AgentId,
  gameState?: GameState,
): string {
  if (id.startsWith('faction-')) {
    assertIsFactionId(id)
    const faction = getFactionById(id)
    return faction.name
  }

  if (id.startsWith('lead-')) {
    assertIsLeadId(id)
    const lead = getLeadById(id)
    return lead.name
  }

  if (id.startsWith('investigation-')) {
    assertIsLeadInvestigationId(id)
    assertDefined(gameState, 'gameState is required')
    const investigation = getLeadInvestigationById(id, gameState)
    const lead = getLeadById(investigation.leadId)
    const numericPart = fmtNoPrefix(id, 'investigation-')
    return `${numericPart} ${lead.name}`
  }

  if (id.startsWith('mission-')) {
    assertIsMissionId(id)
    assertDefined(gameState, 'gameState is required')
    const mission = getMissionById(id, gameState)
    const missionDef = getMissionDefById(mission.missionDefId)
    const numericPart = fmtNoPrefix(id, 'mission-')
    return `${numericPart} ${missionDef.name}`
  }

  if (id.startsWith('agent-')) {
    return id
  }

  assertUnreachable(id)
}
