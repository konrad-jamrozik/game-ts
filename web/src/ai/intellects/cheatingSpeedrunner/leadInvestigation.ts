import type { PlayTurnAPI } from '../../../lib/model_utils/playTurnApiTypes'
import type { GameState } from '../../../lib/model/gameStateModel'
import type { Lead } from '../../../lib/model/leadModel'
import { getAvailableLeadsForInvestigation } from '../../../lib/model_utils/leadUtils'
import { selectReadyAgentIds } from './agentAllocation'

export function startAllAvailableInvestigations(api: PlayTurnAPI): void {
  let lead = selectNextLeadToInvestigate(api.gameState)
  while (lead !== undefined) {
    const agentIds = selectReadyAgentIds(api.gameState, 1)
    if (agentIds.length === 0) {
      return
    }
    api.startLeadInvestigation({ leadId: lead.id, agentIds })
    lead = selectNextLeadToInvestigate(api.gameState)
  }
}

function selectNextLeadToInvestigate(gameState: GameState): Lead | undefined {
  return getAvailableLeadsForInvestigation(gameState)
    .filter((lead) => lead.id !== 'lead-deep-state')
    .filter((lead) => !isCompletedRepeatableLead(gameState, lead))
    .toSorted(compareLeadsByPriority)[0]
}

function isCompletedRepeatableLead(gameState: GameState, lead: Lead): boolean {
  return lead.repeatable && (gameState.leadInvestigationCounts[lead.id] ?? 0) > 0
}

function compareLeadsByPriority(leadA: Lead, leadB: Lead): number {
  const oneTimePriorityDiff = getOneTimeLeadPriority(leadB) - getOneTimeLeadPriority(leadA)
  if (oneTimePriorityDiff !== 0) {
    return oneTimePriorityDiff
  }
  return leadA.id.localeCompare(leadB.id)
}

function getOneTimeLeadPriority(lead: Lead): number {
  return lead.repeatable ? 0 : 1
}
