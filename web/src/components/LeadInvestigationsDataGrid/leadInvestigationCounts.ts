import type { LeadInvestigation } from '../../lib/model/leadModel'

export type LeadInvestigationCounts = {
  active: number
  done: number
  abandoned: number
}

export function calculateLeadInvestigationCounts(
  leadInvestigations: Record<string, LeadInvestigation>,
): LeadInvestigationCounts {
  const investigations = Object.values(leadInvestigations)
  const active = investigations.filter((inv) => inv.state === 'Active').length
  const done = investigations.filter((inv) => inv.state === 'Done').length
  const abandoned = investigations.filter((inv) => inv.state === 'Abandoned').length

  return {
    active,
    done,
    abandoned,
  }
}
