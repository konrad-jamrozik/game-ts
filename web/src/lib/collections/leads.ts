import type { Lead } from '../model/model'
import { assertDefined } from '../utils/assert'

export const leads: Lead[] = [
  // Starting lead
  {
    id: 'lead-criminal-orgs',
    title: 'Criminal organizations',
    description: 'Investigate local criminal organizations to find cult connections.',
    intelCost: 10,
    dependsOn: [],
    repeatable: false,
  },

  // Main progression chain
  {
    id: 'lead-red-dawn-location',
    title: 'Locate cult member',
    description: 'Track down a Red Dawn cult member for apprehension.',
    intelCost: 20,
    dependsOn: ['lead-criminal-orgs'],
    repeatable: true,
  },
  {
    id: 'lead-red-dawn-interrogate-member',
    title: 'Interrogate cult member',
    description: 'Extract information from the captured cult member.',
    intelCost: 0,
    dependsOn: ['mission-apprehend-red-dawn'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-safehouse',
    title: 'Locate cult safehouse',
    description: 'Location of a Red Dawn safehouse has been revealed.',
    intelCost: 50,
    dependsOn: ['lead-red-dawn-interrogate-member'],
    repeatable: true,
  },
  {
    id: 'lead-red-dawn-interrogate-handler',
    title: 'Interrogate cult handler',
    description: 'Extract information from the captured cult handler.',
    intelCost: 0,
    dependsOn: ['mission-raid-red-dawn-safehouse'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-outpost',
    title: 'Locate cult outpost',
    description: 'Location of a Red Dawn outpost has been revealed.',
    intelCost: 100,
    dependsOn: ['lead-red-dawn-interrogate-handler'],
    repeatable: true,
  },
  {
    id: 'lead-red-dawn-interrogate-lieutenant',
    title: 'Interrogate cult lieutenant',
    description: 'Extract information from the captured cult lieutenant.',
    intelCost: 0,
    dependsOn: ['mission-raid-red-dawn-outpost'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-base',
    title: 'Locate cult base of operations',
    description: 'Location of the Red Dawn base has been revealed.',
    intelCost: 200,
    dependsOn: ['lead-red-dawn-interrogate-lieutenant'],
    repeatable: true,
  },
  {
    id: 'lead-red-dawn-interrogate-commander',
    title: 'Interrogate cult commander',
    description: 'Extract information from the captured cult commander.',
    intelCost: 0,
    dependsOn: ['mission-raid-red-dawn-base'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-hq',
    title: 'Locate cult HQ',
    description: 'Location of the Red Dawn headquarters has been revealed.',
    intelCost: 500,
    dependsOn: ['lead-red-dawn-interrogate-commander'],
    repeatable: true,
  },
  {
    id: 'lead-red-dawn-interrogate-high-commander',
    title: 'Interrogate cult high commander',
    description: 'Extract information from the captured cult high commander.',
    intelCost: 0,
    dependsOn: ['mission-raid-red-dawn-hq'],
    repeatable: false,
  },

  // Other leads
  {
    id: 'lead-red-dawn-profile',
    title: 'Cult profile',
    description: 'Compile detailed intelligence profile on Red Dawn cult.',
    intelCost: 50,
    dependsOn: ['lead-red-dawn-interrogate-member'],
    repeatable: false,
  },
]

export function getLeadById(leadId: string): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}
