import type { Lead } from '../model/leadModel'
import { assertDefined } from '../primitives/assertPrimitives'
import { factionMothers, type FactionMother, expandTemplateString } from './factions'

type LeadMother = {
  id: string
  title: string // KJA lead title -> name
  description: string
  difficulty: number
  dependsOn: string[]
  repeatable: boolean
  enemyEstimate?: string
}

// KJA move this to *statsTable.ts setup
// Faction-agnostic leads
const staticLeads: Lead[] = [
  {
    id: 'lead-criminal-orgs',
    title: 'Criminal organizations',
    description: 'Investigate local criminal organizations to find cult connections.',
    difficulty: 1,
    dependsOn: [],
    repeatable: false,
  },
  {
    id: 'lead-deep-state',
    title: 'Deep state',
    description: 'Investigate the deep state',
    difficulty: 10, // 10 difficulty = 10 × 100 intel for 100%, or 10 intel for 1%
    dependsOn: [],
    repeatable: false,
  },
  {
    id: 'lead-peace-on-earth',
    title: 'Peace on Earth',
    description: 'With all enemy factions defeated, coordinate the final operation to ensure lasting peace.',
    difficulty: 200,
    dependsOn: ['lead-red-dawn-terminate-cult', 'lead-exalt-terminate-cult', 'lead-black-lotus-terminate-cult'],
    repeatable: false,
  },
]

// Faction-specific lead mothers
const leadMothers: LeadMother[] = [
  {
    id: 'lead-{facId}-member',
    title: 'Locate {facName} member',
    description: 'Track down a {facName} member for apprehension.',
    difficulty: 2,
    dependsOn: ['lead-criminal-orgs'],
    repeatable: true,
    enemyEstimate: 'Expect 2 initiates and 1 operative.',
  },
  {
    id: 'lead-{facId}-interrogate-member',
    title: 'Interrogate member',
    description: 'Extract information from the captured member.',
    difficulty: 2,
    dependsOn: ['mission-apprehend-cult-member-{facId}'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-safehouse',
    title: 'Locate safehouse',
    description: 'Location of a {facName} safehouse has been revealed.',
    difficulty: 10,
    dependsOn: ['lead-{facId}-interrogate-member'],
    repeatable: true,
    enemyEstimate: 'Expect 4 initiates, 4 operatives, and 1 handler.',
  },
  {
    id: 'lead-{facId}-interrogate-handler',
    title: 'Interrogate handler',
    description: 'Extract information from the captured handler.',
    difficulty: 2,
    dependsOn: ['mission-raid-{facId}-safehouse'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-outpost',
    title: 'Locate outpost',
    description: 'Location of a {facName} outpost has been revealed.',
    difficulty: 20,
    dependsOn: ['lead-{facId}-interrogate-handler'],
    repeatable: true,
    enemyEstimate: 'Expect 8 initiates, 8 operatives, 2 soldiers, and 3 handlers.',
  },
  {
    id: 'lead-{facId}-interrogate-soldier',
    title: 'Interrogate soldier',
    description: 'Extract information from the captured soldier.',
    difficulty: 4,
    dependsOn: ['mission-raid-{facId}-outpost'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-training-facility',
    title: 'Locate training facility',
    description: 'Location of a {facName} training facility has been revealed.',
    difficulty: 30,
    dependsOn: ['lead-{facId}-interrogate-soldier'],
    repeatable: true,
    enemyEstimate: 'Expect 30 initiates, 16 operatives, 4 soldiers, 6 handlers, and 1 lieutenant.',
  },
  {
    id: 'lead-{facId}-interrogate-lieutenant',
    title: 'Interrogate lieutenant',
    description: 'Extract information from the captured lieutenant.',
    difficulty: 6,
    dependsOn: ['mission-raid-{facId}-trainfac'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-logistics-hub',
    title: 'Locate logistics hub',
    description: 'Location of a {facName} logistics hub has been revealed.',
    difficulty: 40,
    dependsOn: ['lead-{facId}-interrogate-lieutenant'],
    repeatable: true,
    enemyEstimate:
      'Expect 12 initiates, 24 operatives, 10 soldiers, 2 elites, 5 handlers, 2 lieutenants, and 1 commander.',
  },
  {
    id: 'lead-{facId}-interrogate-commander',
    title: 'Interrogate commander',
    description: 'Extract information from the captured commander.',
    difficulty: 10,
    dependsOn: ['mission-raid-{facId}-logistics-hub'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-command-center',
    title: 'Locate command center',
    description: 'Location of a {facName} command center has been revealed.',
    difficulty: 60,
    dependsOn: ['lead-{facId}-interrogate-commander'],
    repeatable: true,
    enemyEstimate: 'Expect 20 operatives, 20 soldiers, 6 elites, 4 handlers, 4 lieutenants, and 3 commanders.',
  },
  {
    id: 'lead-{facId}-analyze-command-structure',
    title: 'Analyze command structure',
    description: 'Analyze the {facName} command structure.',
    difficulty: 15,
    dependsOn: ['mission-raid-{facId}-command-center'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-regional-stronghold',
    title: 'Locate regional stronghold',
    description: 'Location of a {facName} regional stronghold has been revealed.',
    difficulty: 80,
    dependsOn: ['lead-{facId}-analyze-command-structure'],
    repeatable: true,
    enemyEstimate: 'Expect 40 soldiers, 10 elites, 8 lieutenants, 3 commanders, and 1 high commander.',
  },
  {
    id: 'lead-{facId}-interrogate-high-commander',
    title: 'Interrogate high commander',
    description: 'Extract information from the captured high commander.',
    difficulty: 20,
    dependsOn: ['mission-raid-{facId}-stronghold'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-hq',
    title: 'Locate HQ',
    description: 'Location of the {facName} headquarters has been revealed.',
    difficulty: 100,
    dependsOn: ['lead-{facId}-interrogate-high-commander'],
    repeatable: false,
    enemyEstimate: 'Expect 60 soldiers, 20 elites, 12 lieutenants, 6 commanders, 2 high commanders, and 1 cult leader.',
  },
  {
    id: 'lead-{facId}-interrogate-leader',
    title: 'Interrogate cult leader',
    description: 'Extract information from the captured cult leader.',
    difficulty: 30,
    dependsOn: ['mission-raid-{facId}-hq'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-terminate-cult',
    title: 'Terminate cult',
    description: 'Final operation to terminate the {facName} cult.',
    difficulty: 150,
    dependsOn: ['lead-{facId}-interrogate-leader'],
    repeatable: false,
  },
  {
    id: 'lead-{facId}-profile',
    title: 'Cult profile',
    description: 'Compile detailed intelligence profile on {facName}.',
    difficulty: 5,
    dependsOn: ['lead-{facId}-interrogate-member'],
    repeatable: false,
  },
]

function generateLeadsForFaction(faction: FactionMother): Lead[] {
  return leadMothers.map((template) => ({
    id: expandTemplateString(template.id, faction),
    title: expandTemplateString(template.title, faction),
    description: expandTemplateString(template.description, faction),
    difficulty: template.difficulty,
    dependsOn: template.dependsOn.map((dep) => expandTemplateString(dep, faction)),
    repeatable: template.repeatable,
    ...(template.enemyEstimate !== undefined && {
      enemyEstimate: expandTemplateString(template.enemyEstimate, faction),
    }),
  }))
}

export const leads: Lead[] = [...staticLeads, ...factionMothers.flatMap((faction) => generateLeadsForFaction(faction))]

export function getLeadById(leadId: string): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}
