import type { Lead, LeadInvestigation } from '../../lib/model/leadModel'
import { getLeadStatus } from '../../lib/model_utils/leadUtils'
import type { GameState } from '../../lib/model/gameStateModel'

export type LeadCounts = {
  all: number
  active: number
  inactive: number
  repeatable: number
  /** Rows visible when Archived toolbar filter is selected (see docs/ui/ui_leads_screen.md). */
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

    const archivedInvestigationsForLead = Object.values(gameState.leadInvestigations).filter(
      (investigation) =>
        investigation.leadId === lead.id &&
        (investigation.state === 'Done' || investigation.state === 'Abandoned'),
    )
    archived += archivedInvestigationsForLead.length
    if (status.isArchived && !hasArchivedInvestigationCorrespondingToArchivedLead(lead, archivedInvestigationsForLead)) {
      archived += 1
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

function hasArchivedInvestigationCorrespondingToArchivedLead(
  lead: Lead,
  archivedInvestigationsForLead: readonly LeadInvestigation[],
): boolean {
  return !lead.repeatable && archivedInvestigationsForLead.some((investigation) => investigation.state === 'Done')
}
