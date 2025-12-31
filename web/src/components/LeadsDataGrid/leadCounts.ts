import type { Lead } from '../../lib/model/leadModel'
import { getLeadStatus } from '../../lib/model_utils/leadUtils'
import type { GameState } from '../../lib/model/gameStateModel'

export type LeadCounts = {
  active: number
  inactive: number
  repeatable: number
  archived: number
}

export function calculateLeadCounts(discoveredLeads: Lead[], gameState: GameState): LeadCounts {
  let active = 0
  let inactive = 0
  let repeatable = 0
  let archived = 0

  for (const lead of discoveredLeads) {
    const status = getLeadStatus(lead, gameState)

    if (status.isArchived) {
      archived += 1
    } else if (status.isInactive) {
      inactive += 1
    } else {
      active += 1
      if (lead.repeatable) {
        repeatable += 1
      }
    }
  }

  return {
    active,
    inactive,
    repeatable,
    archived,
  }
}
