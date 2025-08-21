import type { Lead } from '../model/model'
import { assertDefined } from '../utils/assert'

// KJA it must be possible to repeat other missions besides apprehending cult members.

export const leads: Lead[] = [
  // Starting lead
  {
    id: 'lead-criminal-orgs',
    title: 'Criminal organizations',
    description: 'Investigate local criminal organizations to find cult connections.',
    intelCost: 20,
    expiresIn: 'never',
    dependsOn: [],
    repeatable: false,
  },

  // Main progression chain
  {
    id: 'lead-red-dawn-location',
    title: 'Locate cult member',
    description: 'Track down a Red Dawn cult member for apprehension.',
    intelCost: 20,
    expiresIn: 10, // KJA this countdown is not actually implemented yet.
    dependsOn: ['lead-criminal-orgs'],
    repeatable: true,
  },
  {
    id: 'lead-red-dawn-interrogate-member',
    title: 'Interrogate cult member',
    description: 'Extract information from the captured cult member.',
    intelCost: 10,
    expiresIn: 'never',
    dependsOn: ['mission-apprehend-red-dawn'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-safehouse',
    title: 'Raid cult safehouse',
    description: 'Location of a Red Dawn safehouse has been revealed.',
    intelCost: 0,
    expiresIn: 'never',
    dependsOn: ['lead-red-dawn-interrogate-member'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-interrogate-handler',
    title: 'Interrogate cult handler',
    description: 'Extract information from the captured cult handler.',
    intelCost: 20,
    expiresIn: 'never',
    dependsOn: ['mission-raid-red-dawn-safehouse'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-outpost',
    title: 'Raid cult outpost',
    description: 'Location of a Red Dawn outpost has been revealed.',
    intelCost: 0,
    expiresIn: 'never',
    dependsOn: ['lead-red-dawn-interrogate-handler'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-interrogate-lieutenant',
    title: 'Interrogate cult lieutenant',
    description: 'Extract information from the captured cult lieutenant.',
    intelCost: 40,
    expiresIn: 'never',
    dependsOn: ['mission-raid-red-dawn-outpost'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-base',
    title: 'Raid cult base of operations',
    description: 'Location of the Red Dawn base has been revealed.',
    intelCost: 0,
    expiresIn: 'never',
    dependsOn: ['lead-red-dawn-interrogate-lieutenant'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-interrogate-commander',
    title: 'Interrogate cult commander',
    description: 'Extract information from the captured cult commander.',
    intelCost: 80,
    expiresIn: 'never',
    dependsOn: ['mission-raid-red-dawn-base'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-hq',
    title: 'Raid cult HQ',
    description: 'Location of the Red Dawn headquarters has been revealed.',
    intelCost: 0,
    expiresIn: 'never',
    dependsOn: ['lead-red-dawn-interrogate-commander'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-interrogate-high-commander',
    title: 'Interrogate cult high commander',
    description: 'Extract information from the captured cult high commander.',
    intelCost: 160,
    expiresIn: 'never',
    dependsOn: ['mission-raid-red-dawn-hq'],
    repeatable: false,
  },

  // Other leads
  {
    id: 'lead-red-dawn-profile',
    title: 'Cult profile',
    description: 'Compile detailed intelligence profile on Red Dawn cult.',
    intelCost: 50,
    expiresIn: 'never',
    dependsOn: ['lead-red-dawn-interrogate-member'],
    repeatable: false,
  },
]

export function getLeadById(leadId: string): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}
