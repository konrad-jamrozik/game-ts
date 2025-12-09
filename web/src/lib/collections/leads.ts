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
    difficulty: 0, // Instant success
    dependsOn: [],
    repeatable: false,
  },
  {
    id: 'lead-deep-state',
    title: 'Deep state',
    description: 'Investigate the deep state',
    difficulty: 1000, // 1000 intel for 100%, or 10 intel for 1%
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
    difficulty: 100, // 100 intel for 100%, or 1 intel for 1%
    dependsOn: ['lead-criminal-orgs'],
    repeatable: true,
    enemyEstimate: 'Expect to encounter a single low-ranked member.',
  },
  {
    id: 'lead-{factionId}-interrogate-member',
    title: 'Interrogate member',
    description: 'Extract information from the captured member.',
    difficulty: 0, // Instant success (interrogation leads don't need investigation)
    dependsOn: ['mission-apprehend-{factionId}'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-safehouse',
    title: 'Locate safehouse',
    description: 'Location of a {factionName} safehouse has been revealed.',
    difficulty: 200, // 200 intel for 100%, or 2 intel for 1%
    dependsOn: ['lead-{factionId}-interrogate-member'],
    repeatable: true,
    enemyEstimate: 'Expect safehouse to have a dozen low-ranked members.',
  },
  {
    id: 'lead-{factionId}-interrogate-handler',
    title: 'Interrogate handler',
    description: 'Extract information from the captured handler.',
    difficulty: 0, // Instant success
    dependsOn: ['mission-raid-{factionId}-safehouse'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-outpost',
    title: 'Locate outpost',
    description: 'Location of a {factionName} outpost has been revealed.',
    difficulty: 300, // 300 intel for 100%, or 3 intel for 1%
    dependsOn: ['lead-{factionId}-interrogate-handler'],
    repeatable: true,
    enemyEstimate: 'Expect outpost to have several operatives and handlers.',
  },
  {
    id: 'lead-{factionId}-interrogate-lieutenant',
    title: 'Interrogate lieutenant',
    description: 'Extract information from the captured lieutenant.',
    difficulty: 0, // Instant success
    dependsOn: ['mission-raid-{factionId}-outpost'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-base',
    title: 'Locate base',
    description: 'Location of the {factionName} base has been revealed.',
    difficulty: 500, // 500 intel for 100%, or 5 intel for 1%
    dependsOn: ['lead-{factionId}-interrogate-lieutenant'],
    repeatable: true,
    enemyEstimate: 'Expect base to have soldiers, lieutenants, and possibly an elite.',
  },
  {
    id: 'lead-{factionId}-interrogate-commander',
    title: 'Interrogate commander',
    description: 'Extract information from the captured commander.',
    difficulty: 0, // Instant success
    dependsOn: ['mission-raid-{factionId}-base'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-hq',
    title: 'Locate HQ',
    description: 'Location of the {factionName} headquarters has been revealed.',
    difficulty: 1000, // 1000 intel for 100%, or 10 intel for 1%
    dependsOn: ['lead-{factionId}-interrogate-commander'],
    repeatable: true,
    enemyEstimate: 'Expect HQ to be heavily defended with elites and commanders.',
  },
  {
    id: 'lead-{factionId}-interrogate-high-commander',
    title: 'Interrogate high commander',
    description: 'Extract information from the captured high commander.',
    difficulty: 0, // Instant success
    dependsOn: ['mission-raid-{factionId}-hq'],
    repeatable: false,
  },
  {
    id: 'lead-{factionId}-profile',
    title: 'Organization profile',
    description: 'Compile detailed intelligence profile on {factionName}.',
    difficulty: 0, // Instant success
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
