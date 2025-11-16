import { getLeadById } from '../collections/leads'
import { missions } from '../collections/missions'
import { agsV } from '../model/agents/AgentsView'
import type { Agent, GameState, LeadInvestigation, MissionSite, MissionSiteId } from '../model/model'
import { AGENT_EXHAUSTION_INCREASE_PER_TURN } from '../model/ruleset/constants'
import {
  calculateAccumulatedIntel,
  calculateIntelDecayRounded,
  calculateLeadSuccessChance,
} from '../model/ruleset/ruleset'
import type { LeadInvestigationReport } from '../model/turnReportModel'
import { assertDefined } from '../utils/assert'
import { newEnemiesFromSpec } from '../utils/enemyUtils'
import { fmtRollResult } from '../utils/formatUtils'
import { rollAgainstProbability } from './rolls'

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

  // Calculate intel decay before applying it
  const intelDecay = calculateIntelDecayRounded(investigation.accumulatedIntel)

  // Apply intel decay (before accumulation)
  investigation.accumulatedIntel = Math.max(0, investigation.accumulatedIntel - intelDecay)

  // Accumulate new intel from assigned agents (same formula as espionage)
  const investigatingAgents = getInvestigatingAgents(state, investigation)
  const accumulatedIntel = calculateAccumulatedIntel(investigatingAgents)
  investigation.accumulatedIntel += accumulatedIntel

  const agents = agsV(state.agents)
  agents.investigatingLead(investigation.id).applyExhaustion(AGENT_EXHAUSTION_INCREASE_PER_TURN)

  const createdMissionSites = success ? completeInvestigation(state, investigation, investigatingAgents) : undefined

  return {
    investigationId: investigation.id,
    leadId: investigation.leadId,
    completed: success,
    accumulatedIntel: investigation.accumulatedIntel,
    successChance,
    intelDecay,
    ...(createdMissionSites !== undefined && { createdMissionSites }),
  }
}

/**
 * Rolls for investigation success and logs the result
 */
function rollAndLogInvestigationResult(investigation: LeadInvestigation): { success: boolean; successChance: number } {
  const lead = getLeadById(investigation.leadId)
  const successChance = calculateLeadSuccessChance(investigation.accumulatedIntel, lead.difficulty)
  const rollResult = rollAgainstProbability(successChance)
  const rollResultStr = fmtRollResult(rollResult)
  console.log(`${investigation.id} result: ${rollResultStr}`)
  return { success: rollResult.success, successChance }
}

/**
 * Gets agents that are actively investigating the lead
 */
function getInvestigatingAgents(state: GameState, investigation: LeadInvestigation): Agent[] {
  const agents = agsV(state.agents).withIds(investigation.agentIds)
  return agents
    .toAgentArray()
    .filter((agent) => agent.assignment === investigation.id && agent.state === 'OnAssignment')
}

/**
 * Completes a successful investigation: creates mission sites, updates agents, marks investigation as successful
 * Returns created mission sites
 */
function completeInvestigation(
  state: GameState,
  investigation: LeadInvestigation,
  investigatingAgents: Agent[],
): string[] {
  // Increment lead investigation count
  const currentCount = state.leadInvestigationCounts[investigation.leadId] ?? 0
  state.leadInvestigationCounts[investigation.leadId] = currentCount + 1

  // Create mission sites for dependent missions
  const missionSites = createMissionSitesForLead(state, investigation.leadId)
  const createdMissionSites = missionSites.map((site) => site.id)

  // Mark investigation as successful and clear agent assignments
  investigation.state = 'Successful'
  investigation.agentIds = []

  // Return agents to standby
  for (const agent of investigatingAgents) {
    agent.assignment = 'Standby'
    agent.state = 'InTransit'
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
    const newMissionSite: MissionSite = {
      id: missionSiteId,
      missionId: mission.id,
      agentIds: [],
      state: 'Active',
      expiresIn: mission.expiresIn,
      enemies: newEnemiesFromSpec(mission.enemyUnitsSpec),
    }
    state.missionSites.push(newMissionSite)
    createdMissionSites.push(newMissionSite)
  }

  return createdMissionSites
}
