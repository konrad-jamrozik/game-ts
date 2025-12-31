import { dataTables } from '../../data_tables/dataTables'
import { getLeadById } from '../../model_utils/leadUtils'
import { applyExhaustion, investigatingAgents } from '../../model_utils/agentUtils'
import type { LeadInvestigation } from '../../model/leadModel'
import type { Mission } from '../../model/missionModel'
import type { Agent } from '../../model/agentModel'
import type { GameState } from '../../model/gameStateModel'
import { AGENT_EXHAUSTION_INCREASE_PER_TURN } from '../../data_tables/constants'
import { f6c100, f6ge } from '../../primitives/fixed6'
import { getLeadIntelFromAgents, getLeadSuccessChance } from '../../ruleset/leadRuleset'
import type { LeadInvestigationReport } from '../../model/turnReportModel'
import { assertDefined } from '../../primitives/assertPrimitives'
import { rollAgainstProbabilityQuantized } from '../../primitives/rolls'
import { recallAgentsLogic } from '../../../redux/reducers/agentReducers'
import { bldMission } from '../../factories/missionFactory'
import { getFactionById, getFactionName } from '../../model_utils/factionUtils'
import { log } from '../../primitives/logger'
import type { FactionId } from '../../model/modelIds'

/**
 * Updates lead investigations: applies decay, accumulates intel, checks for completion
 * Returns reports for each investigation updated
 */
export function updateLeadInvestigations(state: GameState): LeadInvestigationReport[] {
  const reports: LeadInvestigationReport[] = []
  const investigationIds = Object.keys(state.leadInvestigations)

  for (const investigationId of investigationIds) {
    const investigation = state.leadInvestigations[investigationId]
    assertDefined(investigation, `Investigation not found: ${investigationId}`)
    if (investigation.state === 'Active') {
      const report = processActiveInvestigation(state, investigation)
      reports.push(report)
    }
  }

  return reports
}

/**
 * Processes a single active investigation
 */
function processActiveInvestigation(state: GameState, investigation: LeadInvestigation): LeadInvestigationReport {
  const { success, successChance } = rollAndLogInvestigationResult(investigation)

  // No passive decay - Intel only decreases when agents are removed (handled in agentReducers)

  // Accumulate new intel from assigned agents using Probability Pressure system
  const agentsInvestigating = investigatingAgents(state.agents, investigation)
  const lead = getLeadById(investigation.leadId)
  const intelGain = getLeadIntelFromAgents(agentsInvestigating, investigation.accumulatedIntel, lead.difficulty)
  investigation.accumulatedIntel += intelGain

  applyExhaustion(agentsInvestigating, AGENT_EXHAUSTION_INCREASE_PER_TURN)

  // Unassign agents with exhaustion >= 100 (mandatory withdrawal)
  unassignExhaustedAgents(state, investigation)

  // Get updated list of agents after exhaustion-based unassignment
  const remainingAgents = investigatingAgents(state.agents, investigation)

  const createdMissions = success ? completeInvestigation(state, investigation, remainingAgents) : undefined

  return {
    investigationId: investigation.id,
    leadId: investigation.leadId,
    completed: success,
    accumulatedIntel: investigation.accumulatedIntel,
    successChance,
    ...(createdMissions !== undefined && { createdMissions }),
  }
}

/**
 * Unassigns agents with exhaustion >= 100 from the investigation.
 * Recalls agents which removes them from investigation, applies proportional intel loss,
 * and sets them to Standby/InTransit. Marks investigation as Abandoned if all agents are removed.
 */
function unassignExhaustedAgents(state: GameState, investigation: LeadInvestigation): void {
  const agentsInvestigating = investigatingAgents(state.agents, investigation)

  // Find exhausted agents (exhaustionPct >= 100)
  const exhaustedAgents = agentsInvestigating.filter((agent) => f6ge(agent.exhaustionPct, f6c100))

  if (exhaustedAgents.length === 0) {
    return
  }

  // Recall exhausted agents (removes from investigation and sets to Standby/InTransit)
  const exhaustedAgentIds = exhaustedAgents.map((agent) => agent.id)
  recallAgentsLogic(state, exhaustedAgentIds)
}

/**
 * Rolls for investigation success and logs the result
 */
function rollAndLogInvestigationResult(investigation: LeadInvestigation): { success: boolean; successChance: number } {
  const lead = getLeadById(investigation.leadId)
  const successChance = getLeadSuccessChance(investigation.accumulatedIntel, lead.difficulty)
  const rollResult = rollAgainstProbabilityQuantized(successChance, 'lead-investigation')
  // const rollResultStr = fmtRollResultQuantized(rollResult)
  // console.log(`${investigation.id} result: ${rollResultStr}`)
  return { success: rollResult.success, successChance }
}

/**
 * Completes a successful investigation: creates missions, updates agents, marks investigation as successful
 * Returns created mission IDs
 */
function completeInvestigation(
  state: GameState,
  investigation: LeadInvestigation,
  agentsInvestigating: Agent[],
): string[] {
  // Increment lead investigation count
  const currentCount = state.leadInvestigationCounts[investigation.leadId] ?? 0
  state.leadInvestigationCounts[investigation.leadId] = currentCount + 1

  // Create missions for dependent missions
  const missions = bldMissionsFromLeadCompletion(state, investigation.leadId)
  const createdMissionIds = missions.map((m) => m.id)

  // Add missions to state
  for (const mission of missions) {
    state.missions.push(mission)
  }

  // Check if this is a terminate-cult lead completion and terminate the faction if so
  maybeTerminateFactionFromLeadId(state, investigation.leadId)

  // Mark investigation as done and clear agent assignments
  investigation.state = 'Done'
  investigation.agentIds = []

  // Return agents to InTransit state (they will transition to Available on next turn)
  for (const agent of agentsInvestigating) {
    agent.assignment = 'Standby'
    agent.state = 'StartingTransit'
  }

  return createdMissionIds
}

/**
 * Terminates a faction by setting its operation counter to Infinity and suppression to 0.
 * The terminated state itself is derived from lead investigation counts, so no flag is set.
 * Abandons all active investigations for this faction's leads and returns agents to InTransit/Standby.
 */
export function terminateFaction(state: GameState, factionId: FactionId): void {
  const faction = getFactionById(state, factionId)
  const factionName = getFactionName(faction)
  log.info('general', `Faction "${factionName}" terminated`)
  faction.turnsUntilNextOperation = Infinity
  faction.suppressionTurns = 0

  // Abandon all active investigations for this faction's leads
  const facId = faction.factionDataId.replace('factiondata-', '')
  for (const investigation of Object.values(state.leadInvestigations)) {
    if (investigation.state !== 'Active') {
      continue
    }
    // KJA3 is this case even possible?
    if (!investigation.leadId.startsWith(`lead-${facId}-`)) {
      continue
    }
    // Abandon investigation and return agents to Standby/InTransit
    const agentIdsToRemove = [...investigation.agentIds]
    recallAgentsLogic(state, agentIdsToRemove)
  }
}

/**
 * Checks if a lead ID is a terminate-cult lead and terminates the corresponding faction if so.
 * @param state - The game state
 * @param leadId - The lead ID to check
 */
export function maybeTerminateFactionFromLeadId(state: GameState, leadId: string): void {
  const terminateCultRegex = /^lead-(?<facId>.+)-terminate-cult$/u
  const terminateCultMatch = terminateCultRegex.exec(leadId)
  if (terminateCultMatch !== null) {
    const facId = terminateCultMatch.groups?.['facId']
    if (facId !== undefined) {
      // Find faction by matching factionDataId (e.g., 'factiondata-red-dawn' matches 'red-dawn')
      const faction = state.factions.find((f) => f.factionDataId === `factiondata-${facId}`)
      if (faction !== undefined) {
        terminateFaction(state, faction.id)
      }
    }
  }
}

/**
 * Creates missions for all missions that depend on the completed lead
 */
function bldMissionsFromLeadCompletion(state: GameState, leadId: string): Mission[] {
  const dependentMissionData = dataTables.offensiveMissions.filter((missionData) =>
    missionData.dependsOn.includes(leadId),
  )
  const createdMissions: Mission[] = []

  for (const missionData of dependentMissionData) {
    // All missions created from leads are offensive missions (apprehend/raid), so they have undefined operationLevel
    const newMission = bldMission({
      missionCount: state.missions.length + createdMissions.length,
      missionDataId: missionData.id,
    })
    createdMissions.push(newMission)
  }

  return createdMissions
}
