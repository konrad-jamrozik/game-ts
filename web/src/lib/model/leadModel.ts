import type { LeadInvestigationState } from './outcomeTypes'
import type { AgentId } from './agentModel'

export type { LeadInvestigationState } from './outcomeTypes'

export type LeadId = `lead-${string}`

export type LeadInvestigationId = `investigation-${string}`

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

export function asLeadId(id: string): LeadId {
  assertIsLeadId(id)
  return id
}

export function assertIsLeadId(id: string): asserts id is LeadId {
  if (!id.startsWith('lead-')) {
    throw new Error(`Invalid lead ID: ${id}`)
  }
}

export function assertIsLeadInvestigationId(id: string): asserts id is LeadInvestigationId {
  if (!id.startsWith('investigation-')) {
    throw new Error(`Invalid lead investigation ID: ${id}`)
  }
}
