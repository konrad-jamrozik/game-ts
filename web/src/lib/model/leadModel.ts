import type { LeadInvestigationState } from './outcomeTypes'

export type { LeadInvestigationState } from './outcomeTypes'

export type LeadInvestigationId = `investigation-${string}`

export type Lead = {
  id: string
  name: string
  difficulty: number
  description: string
  dependsOn: string[]
  repeatable: boolean
  enemyEstimate?: string // For observability, e.g., "Expect safehouse to have a dozen low-ranked cult members"
}

export type LeadInvestigation = {
  id: LeadInvestigationId // unique investigation ID
  leadId: string
  accumulatedIntel: number
  agentIds: string[] // agents currently investigating this lead
  startTurn: number // turn when investigation started
  state: LeadInvestigationState
}
