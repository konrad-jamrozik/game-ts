import type { LeadId, LeadInvestigationId } from '../model/leadModel'
import type { MissionId, MissionDataId } from '../model/missionModel'
import type { AgentId } from '../model/agentModel'
import type { FactionId } from '../model/factionModel'

export function assertIsFactionId(id: string): asserts id is FactionId {
  if (!id.startsWith('faction-')) {
    throw new Error(`Invalid faction ID: ${id}`)
  }
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

export function assertIsMissionId(id: string): asserts id is MissionId {
  if (!id.startsWith('mission-')) {
    throw new Error(`Invalid mission ID: ${id}`)
  }
}

export function assertIsMissionDataId(id: string): asserts id is MissionDataId {
  if (!id.startsWith('missiondata-')) {
    throw new Error(`Invalid mission data ID: ${id}`)
  }
}

// Legacy function for backward compatibility during migration
export function assertIsMissionDefId(id: string): asserts id is MissionDataId {
  assertIsMissionDataId(id)
}

export function assertIsAgentId(id: string): asserts id is AgentId {
  if (!id.startsWith('agent-')) {
    throw new Error(`Invalid agent ID: ${id}`)
  }
}
