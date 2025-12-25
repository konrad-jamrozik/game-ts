import type { LeadInvestigationState } from './outcomeTypes'
import type { AgentId } from './agentModel'
import type { LeadId, LeadInvestigationId } from './modelIds'

export type { LeadInvestigationState } from './outcomeTypes'

export type { LeadId, LeadInvestigationId } from './modelIds'

export type Lead = {
  id: LeadId
  name: string
  difficulty: number
  description: string
  dependsOn: string[]
  repeatable: boolean
  enemyEstimate?: string // For observability, e.g., "Expect safehouse to have a dozen low-ranked cult members"
}

export type LeadInvestigation = {
  id: LeadInvestigationId // unique investigation ID
  leadId: LeadId
  accumulatedIntel: number
  agentIds: AgentId[] // agents currently investigating this lead
  startTurn: number // turn when investigation started
  state: LeadInvestigationState
}
