import { getLeadById, dataTables } from '../../data_tables/dataTables'
import { applyExhaustion, investigatingAgents } from '../../model_utils/agentUtils'
import type { LeadInvestigation } from '../../model/leadModel'
import type { Mission } from '../../model/missionModel'
import type { Agent } from '../../model/agentModel'
import type { GameState } from '../../model/gameStateModel'
import { AGENT_EXHAUSTION_INCREASE_PER_TURN } from '../../data_tables/constants'
import { getLeadIntelFromAgents, getLeadSuccessChance } from '../../ruleset/leadRuleset'
import type { LeadInvestigationReport } from '../../model/turnReportModel'
import { assertDefined } from '../../primitives/assertPrimitives'
import { rollAgainstProbabilityQuantized } from '../../primitives/rolls'
import { removeAgentsFromInvestigation } from '../../../redux/reducers/agentReducers'
import { bldMission } from '../../factories/missionFactory'

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
      expiresIn: missionData.expiresIn,
      enemyCounts: missionData.enemyCounts,
    })
    createdMissions.push(newMission)
  }

  return createdMissions
}
