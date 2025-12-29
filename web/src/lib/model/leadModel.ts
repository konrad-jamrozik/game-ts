import type { LeadInvestigationState } from './outcomeTypes'
import type { AgentId, LeadId, LeadInvestigationId } from './modelIds'

export type Lead = {
  id: LeadId
  name: string
  difficulty: number
  description: string
  dependsOn: string[]
  repeatable: boolean
}

export type LeadInvestigation = {
  id: LeadInvestigationId // unique investigation ID
  leadId: LeadId
  accumulatedIntel: number
  agentIds: AgentId[] // agents currently investigating this lead
  startTurn: number // turn when investigation started
  state: LeadInvestigationState
}
