import pluralize from 'pluralize'
import { getFactionDataById } from './factionUtils'
import { getLeadById } from './leadUtils'
import { getMissionById, getMissionDataById } from './missionUtils'
import type { EnemyType } from '../model/enemyModel'
import type { GameState } from '../model/gameStateModel'
import {
  asFactionId,
  asLeadId,
  asLeadInvestigationId,
  asMissionId,
  type AgentId,
  type EnemyId,
  type FactionId,
  type LeadId,
  type LeadInvestigationId,
  type MissionDataId,
  type MissionId,
} from '../model/modelIds'
import type { ValueChange } from '../model/turnReportModel'
import { assertDefined, assertUnreachable } from '../primitives/assertPrimitives'
import { f6fmtPctDec2, isF6, type Fixed6 } from '../primitives/fixed6'
import { fmtNoPrefix } from '../primitives/formatPrimitives'
import { floorToDec2 } from '../primitives/mathPrimitives'

/**
 * Formats a numeric agent ID into the standard agent ID format.
 * @param numericId - The numeric ID (e.g., 0, 1, 2, ...)
 * @returns The formatted agent ID (e.g., "agent-000", "agent-001", "agent-002")
 */
export function fmtAgentId(numericId: number): AgentId {
  return `agent-${numericId.toString().padStart(3, '0')}`
}

/**
 * Formats a numeric mission ID into the standard mission ID format.
 * @param numericId - The numeric ID (e.g., 0, 1, 2, ...)
 * @returns The formatted mission ID (e.g., "mission-000", "mission-001", "mission-002")
 */
export function fmtMissionId(numericId: number): MissionId {
  return `mission-${numericId.toString().padStart(3, '0')}`
}

/**
 * Formats a numeric lead investigation ID into the standard investigation ID format.
 * @param numericId - The numeric ID (e.g., 0, 1, 2, ...)
 * @returns The formatted investigation ID (e.g., "investigation-000", "investigation-001", "investigation-002")
 */
export function fmtLeadInvestigationId(numericId: number): LeadInvestigationId {
  return `investigation-${numericId.toString().padStart(3, '0')}`
}

export function fmtEnemyId(type: EnemyType, numericId: number): EnemyId {
  return `enemy-${type}-${numericId.toString().padStart(3, '0')}`
}

/**
 * Formats mission target for display
 */
export function fmtMissionTarget(missionId: MissionId | undefined): string {
  if (missionId === undefined) {
    return 'mission ?'
  }
  const displayId = missionId.replaceAll('mission-', '')
  return `mission ${displayId}`
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
export function fmtIdForDisplay(
  id: FactionId | LeadId | LeadInvestigationId | MissionId | MissionDataId | AgentId,
  gameState?: GameState,
): string {
  if (id.startsWith('faction-')) {
    const factionId = asFactionId(id)
    const factionData = getFactionDataById(factionId)
    return factionData.name
  }

  if (id.startsWith('lead-')) {
    const lead = getLeadById(asLeadId(id))
    return lead.name
  }

  if (id.startsWith('investigation-')) {
    const investigationId = asLeadInvestigationId(id)
    assertDefined(gameState, 'gameState is required')
    const investigation = gameState.leadInvestigations[investigationId]
    assertDefined(investigation, `Lead investigation with id ${investigationId} not found`)
    const lead = getLeadById(investigation.leadId)
    const numericPart = fmtNoPrefix(investigationId, 'investigation-')
    return `${numericPart} ${lead.name}`
  }

  if (id.startsWith('mission-')) {
    const missionId = asMissionId(id)
    assertDefined(gameState, 'gameState is required')
    const mission = getMissionById(missionId, gameState)
    const missionData = getMissionDataById(mission.missionDataId)
    const numericPart = fmtNoPrefix(missionId, 'mission-')
    return `${numericPart} ${missionData.name}`
  }

  if (id.startsWith('agent-')) {
    return id
  }

  assertUnreachable(id)
}
