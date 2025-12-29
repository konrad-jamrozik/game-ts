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

export function asFactionId(id: string): FactionId {
  assertIsFactionId(id)
  return id
}

export function asLeadInvestigationId(id: string): LeadInvestigationId {
  assertIsLeadInvestigationId(id)
  return id
}

export function asMissionId(id: string): MissionId {
  assertIsMissionId(id)
  return id
}

export function asAgentId(id: string): AgentId {
  assertIsAgentId(id)
  return id
}

export function asMissionDataId(id: string): MissionDataId {
  assertIsMissionDataId(id)
  return id
}

export function asFactionDataId(id: string): FactionDataId {
  assertIsFactionDataId(id)
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

export function assertIsFactionDataId(id: string): asserts id is FactionDataId {
  if (!id.startsWith('factiondata-')) {
    throw new Error(`Invalid faction data ID: ${id}`)
  }
}

/**
 * Converts a FactionId to a FactionDataId.
 * @param factionId - The faction ID (e.g., 'faction-red-dawn')
 * @returns The faction data ID (e.g., 'factiondata-red-dawn')
 */
export function fmtFactionDataId(factionId: FactionId): FactionDataId {
  return `factiondata-${factionId.replace('faction-', '')}`
}

/**
 * Converts a FactionId to the corresponding profile LeadId.
 * @param factionId - The faction ID (e.g., 'faction-red-dawn')
 * @returns The profile lead ID (e.g., 'lead-red-dawn-profile')
 */
export function fmtFactionProfileLeadId(factionId: FactionId): LeadId {
  return `lead-${factionId.replace('faction-', '')}-profile`
}
