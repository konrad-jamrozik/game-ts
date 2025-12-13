import { getLeadById } from '../../collections/leads'
import { missions } from '../../collections/missions'
import { applyExhaustion, investigatingAgents } from '../../model_utils/agentUtils'
import type { LeadInvestigation, MissionSite, MissionSiteId } from '../../model/model'
import type { Agent } from '../../model/agentModel'
import type { GameState } from '../../model/gameStateModel'
import { AGENT_EXHAUSTION_INCREASE_PER_TURN } from '../../ruleset/constants'
import { getLeadAccumulatedIntel, getLeadSuccessChance } from '../../ruleset/leadRuleset'
import type { LeadInvestigationReport } from '../../model/turnReportModel'
import { assertDefined } from '../../primitives/assertPrimitives'
import { newEnemiesFromSpec } from '../../ruleset/enemyRuleset'
import { rollAgainstProbabilityQuantized } from '../../primitives/rolls'
import { removeAgentsFromInvestigation } from '../../../redux/reducers/agentReducers'

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
  const intelGain = getLeadAccumulatedIntel(agentsInvestigating, investigation.accumulatedIntel, lead.difficulty)
  investigation.accumulatedIntel += intelGain

  applyExhaustion(agentsInvestigating, AGENT_EXHAUSTION_INCREASE_PER_TURN)

  // Unassign agents with exhaustion >= 100 (mandatory withdrawal)
  unassignExhaustedAgents(state, investigation)

  // Get updated list of agents after exhaustion-based unassignment
  const remainingAgents = investigatingAgents(state.agents, investigation)

  const createdMissionSites = success ? completeInvestigation(state, investigation, remainingAgents) : undefined

  return {
    investigationId: investigation.id,
    leadId: investigation.leadId,
    completed: success,
    accumulatedIntel: investigation.accumulatedIntel,
    successChance,
    ...(createdMissionSites !== undefined && { createdMissionSites }),
  }
}

/**
 * Unassigns agents with exhaustion >= 100 from the investigation.
 * Applies proportional intel loss and sets agents to InTransit/Standby.
 * Marks investigation as Abandoned if all agents are removed.
 */
function unassignExhaustedAgents(state: GameState, investigation: LeadInvestigation): void {
  const agentsInvestigating = investigatingAgents(state.agents, investigation)

  // Find exhausted agents (exhaustionPct >= 100)
  const exhaustedAgents = agentsInvestigating.filter((agent) => agent.exhaustionPct >= 100)

  if (exhaustedAgents.length === 0) {
    return
  }

  // Remove exhausted agents from investigation and apply proportional loss
  const exhaustedAgentIds = exhaustedAgents.map((agent) => agent.id)
  removeAgentsFromInvestigation(state, investigation, exhaustedAgentIds)

  // Set agents to InTransit/Standby
  for (const agent of exhaustedAgents) {
    agent.assignment = 'Standby'
    agent.state = 'InTransit'
  }
}

/**
 * Rolls for investigation success and logs the result
 */
function rollAndLogInvestigationResult(investigation: LeadInvestigation): { success: boolean; successChance: number } {
  const lead = getLeadById(investigation.leadId)
  const successChance = getLeadSuccessChance(investigation.accumulatedIntel, lead.difficulty)
  const rollResult = rollAgainstProbabilityQuantized(successChance)
  // const rollResultStr = fmtRollResultQuantized(rollResult)
  // console.log(`${investigation.id} result: ${rollResultStr}`)
  return { success: rollResult.success, successChance }
}

/**
 * Completes a successful investigation: creates mission sites, updates agents, marks investigation as successful
 * Returns created mission sites
 */
function completeInvestigation(
  state: GameState,
  investigation: LeadInvestigation,
  agentsInvestigating: Agent[],
): string[] {
  // Increment lead investigation count
  const currentCount = state.leadInvestigationCounts[investigation.leadId] ?? 0
  state.leadInvestigationCounts[investigation.leadId] = currentCount + 1

  // Create mission sites for dependent missions
  const missionSites = createMissionSitesForLead(state, investigation.leadId)
  const createdMissionSites = missionSites.map((site) => site.id)

  // Mark investigation as done and clear agent assignments
  investigation.state = 'Done'
  investigation.agentIds = []

  // Return agents to InTransit state (they will transition to Available on next turn)
  for (const agent of agentsInvestigating) {
    agent.assignment = 'Standby'
    agent.state = 'StartingTransit'
  }

  return createdMissionSites
}

/**
 * Creates mission sites for all missions that depend on the completed lead
 */
function createMissionSitesForLead(state: GameState, leadId: string): MissionSite[] {
  const dependentMissions = missions.filter((mission) => mission.dependsOn.includes(leadId))
  const createdMissionSites: MissionSite[] = []

  for (const mission of dependentMissions) {
    // Invariant: next mission site numeric id is always the current number of mission sites
    const nextMissionNumericId = state.missionSites.length
    const missionSiteId: MissionSiteId = `mission-site-${nextMissionNumericId.toString().padStart(3, '0')}`
    // All missions created from leads are offensive missions (apprehend/raid), so they have operationLevel 0
    const newMissionSite: MissionSite = {
      id: missionSiteId,
      missionId: mission.id,
      agentIds: [],
      state: 'Active',
      expiresIn: mission.expiresIn,
      enemies: newEnemiesFromSpec(mission.enemyUnitsSpec),
      operationLevel: 0, // Offensive missions have operationLevel 0
    }
    state.missionSites.push(newMissionSite)
    createdMissionSites.push(newMissionSite)
  }

  return createdMissionSites
}
