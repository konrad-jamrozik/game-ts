// ID types
export type AgentId = `agent-${string}`
export type EnemyId = `enemy-${string}`
export type FactionId = 'faction-red-dawn' | 'faction-black-lotus' | 'faction-exalt' | 'faction-followers-of-dagon'
export type FactionDataId = `factiondata-${string}`
export type LeadId = `lead-${string}`
export type LeadInvestigationId = `investigation-${string}`
export type MissionId = `mission-${string}`
export type MissionDataId = `missiondata-${string}`

// Validation functions
export function asLeadId(id: string): LeadId {
  assertIsLeadId(id)
  return id
}

export function assertIsLeadId(id: string): asserts id is LeadId {
  if (!id.startsWith('lead-')) {
    throw new Error(`Invalid lead ID: ${id}`)
  }
}

export function assertIsFactionId(id: string): asserts id is FactionId {
  if (!id.startsWith('faction-')) {
    throw new Error(`Invalid faction ID: ${id}`)
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

export function assertIsAgentId(id: string): asserts id is AgentId {
  if (!id.startsWith('agent-')) {
    throw new Error(`Invalid agent ID: ${id}`)
  }
}
