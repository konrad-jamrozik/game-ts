/**
 * Lead statistics table
 *
 * This table defines all leads in the game - both faction-agnostic static leads
 * and faction-specific leads that are generated from templates.
 *
 * Legend:
 * - Id: Lead ID (may contain {facId} template for faction-specific leads)
 * - Name: Lead name/title (may contain {facName} template)
 * - Description: Lead description (may contain {facName} template)
 * - Difficulty: Intel difficulty level (higher = more intel needed)
 * - DependsOn: List of lead/mission IDs that must be completed first (may contain {facId} template)
 * - Repeatable: Whether this lead can be investigated multiple times
 * - EnemyEstimate: Optional enemy estimate text (may contain {facName} template)
 */

// prettier-ignore
export const LEADS_DATA: LeadStats[] = toLeadStats([
  // Static (faction-agnostic) leads
  // Id, Name, Description, Difficulty, DependsOn, Repeatable, EnemyEstimate
  ['lead-criminal-orgs', 'Criminal organizations', 'Investigate local criminal organizations to find cult connections.', 1, [], false],
  ['lead-deep-state', 'Deep state', 'Investigate the deep state', 10, [], false],
  ['lead-peace-on-earth', 'Peace on Earth', 'With all enemy factions defeated, coordinate the final operation to ensure lasting peace.', 200, ['lead-red-dawn-terminate-cult', 'lead-exalt-terminate-cult', 'lead-black-lotus-terminate-cult'], false],

  // Faction-specific lead templates
  // Id, Name, Description, Difficulty, DependsOn, Repeatable, EnemyEstimate
  ['lead-{facId}-member', 'Locate {facName} member', 'Track down a {facName} member for apprehension.', 2, ['lead-criminal-orgs'], true, 'Expect 2 initiates and 1 operative.'],
  ['lead-{facId}-interrogate-member', 'Interrogate member', 'Extract information from the captured member.', 2, ['mission-def-apprehend-cult-member-{facId}'], false],
  ['lead-{facId}-safehouse', 'Locate safehouse', 'Location of a {facName} safehouse has been revealed.', 10, ['lead-{facId}-interrogate-member'], true, 'Expect 4 initiates, 4 operatives, and 1 handler.'],
  ['lead-{facId}-interrogate-handler', 'Interrogate handler', 'Extract information from the captured handler.', 2, ['mission-def-raid-{facId}-safehouse'], false],
  ['lead-{facId}-outpost', 'Locate outpost', 'Location of a {facName} outpost has been revealed.', 20, ['lead-{facId}-interrogate-handler'], true, 'Expect 8 initiates, 8 operatives, 2 soldiers, and 3 handlers.'],
  ['lead-{facId}-interrogate-soldier', 'Interrogate soldier', 'Extract information from the captured soldier.', 4, ['mission-def-raid-{facId}-outpost'], false],
  ['lead-{facId}-training-facility', 'Locate training facility', 'Location of a {facName} training facility has been revealed.', 30, ['lead-{facId}-interrogate-soldier'], true, 'Expect 30 initiates, 16 operatives, 4 soldiers, 6 handlers, and 1 lieutenant.'],
  ['lead-{facId}-interrogate-lieutenant', 'Interrogate lieutenant', 'Extract information from the captured lieutenant.', 6, ['mission-def-raid-{facId}-trainfac'], false],
  ['lead-{facId}-logistics-hub', 'Locate logistics hub', 'Location of a {facName} logistics hub has been revealed.', 40, ['lead-{facId}-interrogate-lieutenant'], true, 'Expect 12 initiates, 24 operatives, 10 soldiers, 2 elites, 5 handlers, 2 lieutenants, and 1 commander.'],
  ['lead-{facId}-interrogate-commander', 'Interrogate commander', 'Extract information from the captured commander.', 10, ['mission-def-raid-{facId}-logistics-hub'], false],
  ['lead-{facId}-command-center', 'Locate command center', 'Location of a {facName} command center has been revealed.', 60, ['lead-{facId}-interrogate-commander'], true, 'Expect 20 operatives, 20 soldiers, 6 elites, 4 handlers, 4 lieutenants, and 3 commanders.'],
  ['lead-{facId}-analyze-command-structure', 'Analyze command structure', 'Analyze the {facName} command structure.', 15, ['mission-def-raid-{facId}-command-center'], false],
  ['lead-{facId}-regional-stronghold', 'Locate regional stronghold', 'Location of a {facName} regional stronghold has been revealed.', 80, ['lead-{facId}-analyze-command-structure'], true, 'Expect 40 soldiers, 10 elites, 8 lieutenants, 3 commanders, and 1 high commander.'],
  ['lead-{facId}-interrogate-high-commander', 'Interrogate high commander', 'Extract information from the captured high commander.', 20, ['mission-def-raid-{facId}-stronghold'], false],
  ['lead-{facId}-hq', 'Locate HQ', 'Location of the {facName} headquarters has been revealed.', 100, ['lead-{facId}-interrogate-high-commander'], false, 'Expect 60 soldiers, 20 elites, 12 lieutenants, 6 commanders, 2 high commanders, and 1 cult leader.'],
  ['lead-{facId}-interrogate-leader', 'Interrogate cult leader', 'Extract information from the captured cult leader.', 30, ['mission-def-raid-{facId}-hq'], false],
  ['lead-{facId}-terminate-cult', 'Terminate cult', 'Final operation to terminate the {facName} cult.', 150, ['lead-{facId}-interrogate-leader'], false],
  ['lead-{facId}-profile', 'Cult profile', 'Compile detailed intelligence profile on {facName}.', 5, ['lead-{facId}-interrogate-member'], false],
])

export type LeadStats = {
  id: string
  name: string
  description: string
  difficulty: number
  dependsOn: string[]
  repeatable: boolean
  enemyEstimate?: string
}

type LeadStatsRow = [
  id: string,
  name: string,
  description: string,
  difficulty: number,
  dependsOn: string[],
  repeatable: boolean,
  enemyEstimate?: string,
]

function toLeadStats(rows: LeadStatsRow[]): LeadStats[] {
  return rows.map((row) => ({
    id: row[0],
    name: row[1],
    description: row[2],
    difficulty: row[3],
    dependsOn: row[4],
    repeatable: row[5],
    ...(row[6] !== undefined && { enemyEstimate: row[6] }),
  }))
}
