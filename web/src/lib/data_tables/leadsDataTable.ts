/**
 * Lead data table
 *
 * This table defines all leads in the game - both faction-agnostic static leads
 * and faction-specific leads that are generated from templates.
 *
 * Legend:
 * - Id: Lead ID (may contain {facId} template for faction-specific leads)
 * - Name: Lead name/title (may contain {facName} template)
 * - Description: Lead description (may contain {facName} template)
 * - Difficulty: Intel difficulty level (higher = more intel needed). Difficulty of X means the player must accumulate X * 100 intel to have a 100% chance of success.
 * - DependsOn: List of lead/mission IDs that must be completed first (may contain {facId} template)
 * - Repeatable: Whether this lead can be investigated multiple times
 */

import type { Lead } from '../model/leadModel'
import { asLeadId } from '../model/modelIds'
import type { FactionData } from './factionsDataTable'
import { expandTemplateString } from './dataTablesPrivateUtils'

// prettier-ignore
export function bldLeadsTable(factions: readonly FactionData[]): readonly Lead[] {
  return toLeadsDataTable([
  // Static (faction-agnostic) leads
  // Id,                                      Name,                                    Difficulty, Repeatable,  Description,                                                                                  DependsOn,                                                                                        
  ['lead-criminal-orgs',                      'Criminal organizations',                  1,         false,      'Investigate local criminal organizations to find cult connections.',                         [],                                                                                             ],
  ['lead-deep-state',                         'Deep state',                             10,         false,      'Investigate the deep state',                                                                 [],                                                                                             ],
  ['lead-peace-on-earth',                     'Peace on Earth',                        200,         false,      'With all enemy factions defeated, coordinate the final operation to ensure lasting peace.',  ['lead-red-dawn-terminate-cult', 'lead-exalt-terminate-cult', 'lead-black-lotus-terminate-cult']],

  // Faction-specific lead templates
  // Id,                                      Name,                                    Difficulty, Repeatable,  Description,                                                                                   DependsOn,                                                                                     
  ['lead-{facId}-member',                     'Locate {facName} member',                 2,         true ,      'Track down a {facName} member for apprehension.',                                             ['lead-criminal-orgs'],                                                                        ],
  ['lead-{facId}-interrogate-member',         'Inter. {facName} member',                 2,         false,      'Extract information from the captured member.',                                               ['missiondata-apprehend-{facId}-member'],                                                      ],
  ['lead-{facId}-safehouse',                  'Locate {facName} safehouse',             10,         true ,      'Location of a {facName} safehouse has been revealed.',                                        ['lead-{facId}-interrogate-member'],                                                           ],
  ['lead-{facId}-interrogate-handler',        'Inter. {facName} handler',                2,         false,      'Extract information from the captured handler.',                                              ['missiondata-raid-{facId}-safehouse'],                                                        ],
  ['lead-{facId}-outpost',                    'Locate {facName} outpost',               20,         true ,      'Location of a {facName} outpost has been revealed.',                                          ['lead-{facId}-interrogate-handler'],                                                          ],
  ['lead-{facId}-interrogate-soldier',        'Inter. {facName} soldier',                4,         false,      'Extract information from the captured soldier.',                                              ['missiondata-raid-{facId}-outpost'],                                                          ],
  ['lead-{facId}-training-facility',          'Locate {facName} training facility',     30,         true ,      'Location of a {facName} training facility has been revealed.',                                ['lead-{facId}-interrogate-soldier'],                                                          ],
  ['lead-{facId}-interrogate-lieutenant',     'Inter. {facName} lieutenant',             6,         false,      'Extract information from the captured lieutenant.',                                           ['missiondata-raid-{facId}-training-facility'],                                                ],
  ['lead-{facId}-logistics-hub',              'Locate {facName} logistics hub',         40,         true ,      'Location of a {facName} logistics hub has been revealed.',                                    ['lead-{facId}-interrogate-lieutenant'],                                                       ],
  ['lead-{facId}-interrogate-commander',      'Inter. {facName} commander',             10,         false,      'Extract information from the captured commander.',                                            ['missiondata-raid-{facId}-logistics-hub'],                                                    ],
  ['lead-{facId}-command-center',             'Locate {facName} command center',        60,         true ,      'Location of a {facName} command center has been revealed.',                                   ['lead-{facId}-interrogate-commander'],                                                        ],
  ['lead-{facId}-analyze-command-structure',  'Analyze {facName} command structure',    15,         false,      'Analyze the {facName} command structure.',                                                    ['missiondata-raid-{facId}-command-center'],                                                   ],
  ['lead-{facId}-regional-stronghold',        'Locate {facName} regional stronghold',   80,         true ,      'Location of a {facName} regional stronghold has been revealed.',                              ['lead-{facId}-analyze-command-structure'],                                                    ],
  ['lead-{facId}-interrogate-high-commander', 'Inter. {facName} high commander',        20,         false,      'Extract information from the captured high commander.',                                       ['missiondata-raid-{facId}-regional-stronghold'],                                              ],
  ['lead-{facId}-hq',                         'Locate {facName} HQ',                   100,         true,       'Location of the {facName} headquarters has been revealed.',                                   ['lead-{facId}-interrogate-high-commander', '!missiondata-raid-{facId}-hq'],                   ],
  ['lead-{facId}-interrogate-leader',         'Inter. {facName} cult leader',           30,         false,      'Extract information from the captured cult leader.',                                          ['missiondata-raid-{facId}-hq'],                                                               ],
  ['lead-{facId}-terminate-cult',             'Terminate {facName}',                   150,         false,      'Final operation to terminate the {facName} cult.',                                            ['lead-{facId}-interrogate-leader'],                                                           ],
  ['lead-{facId}-profile',                    '{facName} profile',                       5,         false,      'Compile detailed intelligence profile on {facName}.',                                         ['lead-{facId}-interrogate-member'],                                                           ],
  ], factions)
}

/**
 * LeadData is equal to Lead because Lead has no runtime-dependent values, unlike e.g. Faction.
 * E.g. the amount of times given lead was investigated is kept in the game state, and perhaps it should
 * instead be kept in Lead itself. Then distinction between Lead and LeadData would be more clear.
 */
export type LeadData = Lead

type LeadDataRow = [
  id: string,
  name: string,
  difficulty: number,
  repeatable: boolean,
  description: string,
  dependsOn: string[],
]

function toLeadsDataTable(rows: LeadDataRow[], factions: readonly FactionData[]): Lead[] {
  const result: Lead[] = []

  for (const row of rows) {
    const rawLead = {
      id: row[0],
      name: row[1],
      difficulty: row[2],
      repeatable: row[3],
      description: row[4],
      dependsOn: row[5],
    }

    if (rawLead.id.includes('{facId}')) {
      // Faction-specific lead: generate for each faction
      for (const faction of factions) {
        const leadId = asLeadId(expandTemplateString(rawLead.id, faction))
        result.push({
          id: leadId,
          name: expandTemplateString(rawLead.name, faction),
          difficulty: rawLead.difficulty,
          repeatable: rawLead.repeatable,
          description: expandTemplateString(rawLead.description, faction),
          dependsOn: rawLead.dependsOn.map((dep) => expandTemplateString(dep, faction)),
        })
      }
    } else {
      // Static lead: generate once (expandTemplateString will be no-op)
      const leadId = asLeadId(expandTemplateString(rawLead.id))
      result.push({
        id: leadId,
        name: expandTemplateString(rawLead.name),
        difficulty: rawLead.difficulty,
        repeatable: rawLead.repeatable,
        description: expandTemplateString(rawLead.description),
        dependsOn: rawLead.dependsOn.map((dep) => expandTemplateString(dep)),
      })
    }
  }

  return result
}
