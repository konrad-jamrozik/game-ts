import type { Lead } from '../../lib/model/leadModel'
import { getLeadStatus } from '../../lib/model_utils/leadUtils'
import type { GameState } from '../../lib/model/gameStateModel'

export type LeadCounts = {
  all: number
  active: number
  inactive: number
  repeatable: number
  archived: number
}

export function calculateLeadCounts(discoveredLeads: Lead[], gameState: GameState): LeadCounts {
  let all = 0
  let active = 0
  let inactive = 0
  let repeatable = 0
  let archived = 0

  for (const lead of discoveredLeads) {
    const status = getLeadStatus(lead, gameState)

    if (status.isArchived) {
      archived += 1
    } else if (status.isInactive) {
      all += 1
      inactive += 1
    } else {
      all += 1
      active += 1
      if (lead.repeatable) {
        repeatable += 1
      }
    }

    if (lead.repeatable) {
      archived += Object.values(gameState.leadInvestigations).filter(
        (investigation) => investigation.leadId === lead.id && investigation.state === 'Done',
      ).length
    }
  }

  return {
    all,
    active,
    inactive,
    repeatable,
    archived,
  }
}
