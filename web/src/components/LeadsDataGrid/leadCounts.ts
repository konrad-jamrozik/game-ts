import type { Lead } from '../../lib/model/leadModel'
import { getLeadStatus } from '../../lib/model_utils/leadUtils'
import type { GameState } from '../../lib/model/gameStateModel'

export type LeadCounts = {
  all: number
  active: number
  inactive: number
  repeatable: number
  /** Rows visible when Past investigations toolbar filter is selected (see docs/ui/ui_leads_screen.md). */
  pastInvestigations: number
}

export function calculateLeadCounts(discoveredLeads: Lead[], gameState: GameState): LeadCounts {
  let all = 0
  let active = 0
  let inactive = 0
  let repeatable = 0
  let pastInvestigations = 0

  for (const lead of discoveredLeads) {
    const status = getLeadStatus(lead, gameState)

    if (status.isInactive) {
      all += 1
      inactive += 1
    } else if (!status.isArchived) {
      all += 1
      active += 1
      if (lead.repeatable) {
        repeatable += 1
      }
    }

    const terminalForLead = Object.values(gameState.leadInvestigations).filter(
      (investigation) =>
        investigation.leadId === lead.id &&
        (investigation.state === 'Done' || investigation.state === 'Abandoned'),
    )
    pastInvestigations += terminalForLead.length
    if (status.isArchived && terminalForLead.length === 0) {
      // Archived lead still shows one Past row without a Done/Abandoned record (e.g. faction terminated).
      pastInvestigations += 1
    }
  }

  return {
    all,
    active,
    inactive,
    repeatable,
    pastInvestigations,
  }
}
