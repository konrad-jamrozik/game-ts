import type { Lead } from '../model/model'
import { assertDefined } from '../utils/assert'

export const leads: Lead[] = [
  // Starting lead
  {
    id: 'lead-criminal-orgs',
    title: 'Criminal organizations',
    description: 'Investigate local criminal organizations to find cult connections.',
    difficultyConstant: 10, //10_000, // Instant success // KJA temp debug set to 10% for now
    dependsOn: [],
    repeatable: false,
  },

  // Main progression chain
  {
    id: 'lead-red-dawn-location',
    title: 'Locate cult member',
    description: 'Track down a Red Dawn cult member for apprehension.',
    difficultyConstant: 100, // 1% per 1 intel
    dependsOn: ['lead-criminal-orgs'],
    repeatable: true,
    enemyEstimate: 'Expect to encounter a single low-ranked cult member.',
  },
  {
    id: 'lead-red-dawn-interrogate-member',
    title: 'Interrogate cult member',
    description: 'Extract information from the captured cult member.',
    difficultyConstant: 10_000, // Instant success (interrogation leads don't need investigation)
    dependsOn: ['mission-apprehend-red-dawn'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-safehouse',
    title: 'Locate cult safehouse',
    description: 'Location of a Red Dawn safehouse has been revealed.',
    difficultyConstant: 50, // 0.5% per 1 intel
    dependsOn: ['lead-red-dawn-interrogate-member'],
    repeatable: true,
    enemyEstimate: 'Expect safehouse to have a dozen low-ranked cult members.',
  },
  {
    id: 'lead-red-dawn-interrogate-handler',
    title: 'Interrogate cult handler',
    description: 'Extract information from the captured cult handler.',
    difficultyConstant: 10_000, // Instant success
    dependsOn: ['mission-raid-red-dawn-safehouse'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-outpost',
    title: 'Locate cult outpost',
    description: 'Location of a Red Dawn outpost has been revealed.',
    difficultyConstant: 30, // 0.3% per 1 intel
    dependsOn: ['lead-red-dawn-interrogate-handler'],
    repeatable: true,
    enemyEstimate: 'Expect outpost to have several operatives and handlers.',
  },
  {
    id: 'lead-red-dawn-interrogate-lieutenant',
    title: 'Interrogate cult lieutenant',
    description: 'Extract information from the captured cult lieutenant.',
    difficultyConstant: 10_000, // Instant success
    dependsOn: ['mission-raid-red-dawn-outpost'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-base',
    title: 'Locate cult base of operations',
    description: 'Location of the Red Dawn base has been revealed.',
    difficultyConstant: 20, // 0.2% per 1 intel
    dependsOn: ['lead-red-dawn-interrogate-lieutenant'],
    repeatable: true,
    enemyEstimate: 'Expect base to have soldiers, lieutenants, and possibly an elite.',
  },
  {
    id: 'lead-red-dawn-interrogate-commander',
    title: 'Interrogate cult commander',
    description: 'Extract information from the captured cult commander.',
    difficultyConstant: 10_000, // Instant success
    dependsOn: ['mission-raid-red-dawn-base'],
    repeatable: false,
  },
  {
    id: 'lead-red-dawn-hq',
    title: 'Locate cult HQ',
    description: 'Location of the Red Dawn headquarters has been revealed.',
    difficultyConstant: 10, // 0.1% per 1 intel
    dependsOn: ['lead-red-dawn-interrogate-commander'],
    repeatable: true,
    enemyEstimate: 'Expect HQ to be heavily defended with elites and commanders.',
  },
  {
    id: 'lead-red-dawn-interrogate-high-commander',
    title: 'Interrogate cult high commander',
    description: 'Extract information from the captured cult high commander.',
    difficultyConstant: 10_000, // Instant success
    dependsOn: ['mission-raid-red-dawn-hq'],
    repeatable: false,
  },

  // Other leads
  {
    id: 'lead-red-dawn-profile',
    title: 'Cult profile',
    description: 'Compile detailed intelligence profile on Red Dawn cult.',
    difficultyConstant: 10_000, // Instant success
    dependsOn: ['lead-red-dawn-interrogate-member'],
    repeatable: false,
  },
]

export function getLeadById(leadId: string): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}
