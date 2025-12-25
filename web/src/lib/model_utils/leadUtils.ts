import type { LeadId } from '../model/leadModel'

export function asLeadId(id: string): LeadId {
  assertIsLeadId(id)
  return id
}

export function assertIsLeadId(id: string): asserts id is LeadId {
  if (!id.startsWith('lead-')) {
    throw new Error(`Invalid lead ID: ${id}`)
  }
}
