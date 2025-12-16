import type { Lead, LeadId, LeadInvestigation, LeadInvestigationId } from '../model/leadModel'
import { assertDefined } from '../primitives/assertPrimitives'
import { expandTemplateString } from './factions'
import { FACTIONS_DATA_TABLE, type FactionData } from './factionsDataTable'
import { LEADS_DATA_TABLE, type LeadData } from './leadsDataTable'
import { assertIsLeadId } from '../model_utils/assertModelUtils'
import type { GameState } from '../model/gameStateModel'

export const leads: Lead[] = toLeadsCollection(LEADS_DATA_TABLE)

export function getLeadById(leadId: LeadId): Lead {
  const foundLead = leads.find((lead) => lead.id === leadId)
  assertDefined(foundLead, `Lead with id ${leadId} not found`)
  return foundLead
}

export function getLeadInvestigationById(
  investigationId: LeadInvestigationId,
  gameState: GameState,
): LeadInvestigation {
  const investigation = gameState.leadInvestigations[investigationId]
  assertDefined(investigation, `Lead investigation with id ${investigationId} not found`)
  return investigation
}

function toLeadsCollection(data: LeadData[]): Lead[] {
  const result: Lead[] = []

  for (const datum of data) {
    if (datum.id.includes('{facId}')) {
      // Faction-specific lead: generate for each faction
      for (const faction of FACTIONS_DATA_TABLE) {
        result.push(bldLead(datum, faction))
      }
    } else {
      // Static lead: generate once (expandTemplateString will be no-op)
      result.push(bldLead(datum))
    }
  }

  return result
}

function bldLead(datum: LeadData, faction?: FactionData): Lead {
  const leadId = expandTemplateString(datum.id, faction)
  assertIsLeadId(leadId)
  return {
    id: leadId,
    name: expandTemplateString(datum.name, faction),
    description: expandTemplateString(datum.description, faction),
    difficulty: datum.difficulty,
    dependsOn: datum.dependsOn.map((dep) => expandTemplateString(dep, faction)),
    repeatable: datum.repeatable,
    ...(datum.enemyEstimate !== undefined && { enemyEstimate: expandTemplateString(datum.enemyEstimate, faction) }),
  }
}
