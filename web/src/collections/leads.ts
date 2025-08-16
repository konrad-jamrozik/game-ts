import type { Lead } from '../model/lib/model'
import { assertDefined } from '../model/lib/utils/assert'

export const leads: Lead[] = [
  {
    id: 'lead-criminal-orgs',
    title: 'Criminal organizations',
    intelCost: 20,
    description: 'Investigate notorious criminal organizations operating from the shadows.',
    expiresIn: 'never',
    dependsOn: [],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-location',
    title: 'Red Dawn member location',
    intelCost: 20,
    description: 'Locate a member of the Red Dawn cult.',
    expiresIn: 'never',
    dependsOn: ['lead-criminal-orgs'],
    repeatable: true,
  },
  {
    id: 'lead-red-dawn-interrogation',
    title: 'Red Dawn member interrogation',
    intelCost: 0,
    description: 'Interrogate a captured member of the Red Dawn cult.',
    expiresIn: 'never',
    dependsOn: ['mission-apprehend-red-dawn'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-profile',
    title: 'Red Dawn cult profile',
    intelCost: 50,
    description: 'Establish a basic profile about the Red Dawn cult.',
    expiresIn: 'never',
    dependsOn: ['lead-red-dawn-interrogation'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-safehouse',
    title: 'Red Dawn safe house location',
    intelCost: 30,
    description: 'Locate Red Dawn safe house.',
    expiresIn: 'never',
    dependsOn: ['lead-red-dawn-interrogation'],
    repeatable: true,
  },
]

export function getLeadById(leadId: string): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}
