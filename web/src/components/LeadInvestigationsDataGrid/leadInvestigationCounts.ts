import type { LeadInvestigation } from '../../lib/model/leadModel'

export type LeadInvestigationCounts = {
  active: number
  done: number
}

export function calculateLeadInvestigationCounts(
  leadInvestigations: Record<string, LeadInvestigation>,
): LeadInvestigationCounts {
  const investigations = Object.values(leadInvestigations)
  const active = investigations.filter((inv) => inv.state === 'Active').length
  const done = investigations.filter((inv) => inv.state === 'Done').length

  return {
    active,
    done,
  }
}
