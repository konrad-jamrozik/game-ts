import type { Lead } from '../model/model'
import { assertDefined } from '../primitives/assertPrimitives'
import { factionDefinitions, type FactionDefinition } from './factions'

type LeadTemplate = {
  id: string
  title: string
  description: string
  difficulty: number
  dependsOn: string[]
  repeatable: boolean
  enemyEstimate?: string
}

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
]

// Faction-specific lead templates
const leadTemplates: LeadTemplate[] = [
  {
    id: 'lead-{factionId}-location',
    title: 'Locate {factionName} member',
    description: 'Track down a {factionName} member for apprehension.',
    difficulty: 2,
    dependsOn: ['lead-criminal-orgs'],
    repeatable: true,
    enemyEstimate: 'Expect 2 initiates and 1 operative.',
  },
  {
    id: 'lead-{factionId}-interrogate-member',
    title: 'Interrogate member',
    description: 'Extract information from the captured member.',
    difficulty: 2,
    dependsOn: ['mission-apprehend-{factionId}'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-safehouse',
    title: 'Locate safehouse',
    description: 'Location of a {factionName} safehouse has been revealed.',
    difficulty: 10,
    dependsOn: ['lead-{factionId}-interrogate-member'],
    repeatable: true,
    enemyEstimate: 'Expect 4 initiates, 4 operatives, and 1 handler.',
  },
  {
    id: 'lead-{factionId}-interrogate-handler',
    title: 'Interrogate handler',
    description: 'Extract information from the captured handler.',
    difficulty: 2,
    dependsOn: ['mission-raid-{factionId}-safehouse'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-outpost',
    title: 'Locate outpost',
    description: 'Location of a {factionName} outpost has been revealed.',
    difficulty: 20,
    dependsOn: ['lead-{factionId}-interrogate-handler'],
    repeatable: true,
    enemyEstimate: 'Expect 8 initiates, 8 operatives, 2 soldiers, and 3 handlers.',
  },
  {
    id: 'lead-{factionId}-interrogate-soldier',
    title: 'Interrogate soldier',
    description: 'Extract information from the captured soldier.',
    difficulty: 4,
    dependsOn: ['mission-raid-{factionId}-outpost'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-training-facility',
    title: 'Locate training facility',
    description: 'Location of a {factionName} training facility has been revealed.',
    difficulty: 30,
    dependsOn: ['lead-{factionId}-interrogate-soldier'],
    repeatable: true,
    enemyEstimate: 'Expect 30 initiates, 16 operatives, 4 soldiers, 6 handlers, and 1 lieutenant.',
  },
  {
    id: 'lead-{factionId}-interrogate-lieutenant',
    title: 'Interrogate lieutenant',
    description: 'Extract information from the captured lieutenant.',
    difficulty: 6,
    dependsOn: ['mission-raid-{factionId}-base'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-logistics-hub',
    title: 'Locate logistics hub',
    description: 'Location of a {factionName} logistics hub has been revealed.',
    difficulty: 40,
    dependsOn: ['lead-{factionId}-interrogate-lieutenant'],
    repeatable: true,
    enemyEstimate:
      'Expect 12 initiates, 24 operatives, 10 soldiers, 2 elites, 5 handlers, 2 lieutenants, and 1 commander.',
  },
  {
    id: 'lead-{factionId}-interrogate-commander',
    title: 'Interrogate commander',
    description: 'Extract information from the captured commander.',
    difficulty: 10,
    dependsOn: ['mission-raid-{factionId}-logistics-hub'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-command-center',
    title: 'Locate command center',
    description: 'Location of a {factionName} command center has been revealed.',
    difficulty: 60,
    dependsOn: ['lead-{factionId}-interrogate-commander'],
    repeatable: true,
    enemyEstimate: 'Expect 20 operatives, 20 soldiers, 6 elites, 4 handlers, 4 lieutenants, and 3 commanders.',
  },
  {
    id: 'lead-{factionId}-analyze-command-structure',
    title: 'Analyze command structure',
    description: 'Analyze the {factionName} command structure.',
    difficulty: 15,
    dependsOn: ['mission-raid-{factionId}-command-center'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-regional-stronghold',
    title: 'Locate regional stronghold',
    description: 'Location of a {factionName} regional stronghold has been revealed.',
    difficulty: 80,
    dependsOn: ['lead-{factionId}-analyze-command-structure'],
    repeatable: true,
    enemyEstimate: 'Expect 40 soldiers, 10 elites, 8 lieutenants, 3 commanders, and 1 high commander.',
  },
  {
    id: 'lead-{factionId}-interrogate-high-commander',
    title: 'Interrogate high commander',
    description: 'Extract information from the captured high commander.',
    difficulty: 20,
    dependsOn: ['mission-raid-{factionId}-stronghold'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-hq',
    title: 'Locate HQ',
    description: 'Location of the {factionName} headquarters has been revealed.',
    difficulty: 100,
    dependsOn: ['lead-{factionId}-interrogate-high-commander'],
    repeatable: false,
    enemyEstimate: 'Expect 60 soldiers, 20 elites, 12 lieutenants, 6 commanders, 2 high commanders, and 1 cult leader.',
  },
  {
    id: 'lead-{factionId}-interrogate-leader',
    title: 'Interrogate cult leader',
    description: 'Extract information from the captured cult leader.',
    difficulty: 30,
    dependsOn: ['mission-raid-{factionId}-hq'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-terminate-cult',
    title: 'Terminate cult',
    description: 'Final operation to terminate the {factionName} cult.',
    difficulty: 150,
    dependsOn: ['lead-{factionId}-interrogate-leader'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-profile',
    title: 'Cult profile',
    description: 'Compile detailed intelligence profile on {factionName}.',
    difficulty: 5,
    dependsOn: ['lead-{factionId}-interrogate-member'],
    repeatable: false,
  },
]

function expandTemplateString(template: string, faction: FactionDefinition): string {
  return template.replaceAll('{factionId}', faction.shortId).replaceAll('{factionName}', faction.name)
}

function generateLeadsForFaction(faction: FactionDefinition): Lead[] {
  return leadTemplates.map((template) => ({
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

export const leads: Lead[] = [
  ...staticLeads,
  ...factionDefinitions.flatMap((faction) => generateLeadsForFaction(faction)),
]

export function getLeadById(leadId: string): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}
