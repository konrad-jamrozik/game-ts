import type { LeadInvestigation, LeadInvestigationId } from '../model/leadModel'
import type { GameState } from '../model/gameStateModel'
import { assertDefined } from '../primitives/assertPrimitives'

/**
 * Looks up a lead investigation by ID in the game state
 */
export function getLeadInvestigationById(
  investigationId: LeadInvestigationId,
  gameState: GameState,
): LeadInvestigation {
  const investigation = gameState.leadInvestigations[investigationId]
  assertDefined(investigation, `Lead investigation with id ${investigationId} not found`)
  return investigation
}
