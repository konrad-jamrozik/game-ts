import { assertDefined } from '../primitives/assertPrimitives'
import { dataTables } from '../data_tables/dataTables'
import type { Lead } from '../model/leadModel'
import type { LeadId } from '../model/modelIds'

export function getLeadById(id: LeadId): Lead {
  const found = dataTables.leads.find((lead) => lead.id === id)
  assertDefined(found, `Lead with id ${id} not found`)
  return found
}
