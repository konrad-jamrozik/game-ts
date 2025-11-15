import { getLeadById } from '../collections/leads'
import { missions } from '../collections/missions'
import { agsV } from '../model/agents/AgentsView'
import type { Bps } from '../model/bps'
import type { Agent, GameState, LeadInvestigation, MissionSite, MissionSiteId } from '../model/model'
import {
  calculateAccumulatedIntel,
  calculateIntelDecayAmount,
  calculateLeadSuccessChance,
} from '../model/ruleset/ruleset'
import type { LeadInvestigationReport } from '../model/turnReportModel'
import { assertDefined } from '../utils/assert'
import { newEnemiesFromSpec } from '../utils/enemyUtils'
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
      const report = processInvestigation(state, investigation)
      reports.push(report)
    }
  }

  return reports
}

/**
 * Processes a single active investigation
 */
function processInvestigation(state: GameState, investigation: LeadInvestigation): LeadInvestigationReport {
  const lead = getLeadById(investigation.leadId)
  const investigatingAgents = getInvestigatingAgents(state, investigation)

  const { successChance, success } = rollForInvestigationSuccess(investigation.accumulatedIntel, lead.difficulty)

  if (success) {
    return completeInvestigation(state, investigation, investigatingAgents, successChance)
  }
  return continueInvestigation(investigation, investigatingAgents, successChance)
}

/**
 * Calculates success chance and rolls for investigation completion
 */
function rollForInvestigationSuccess(
  accumulatedIntel: number,
  difficulty: Bps,
): { successChance: Bps; success: boolean } {
  const successChance = calculateLeadSuccessChance(accumulatedIntel, difficulty)
  const successProbability = successChance.value / 10_000
  const [success] = rollAgainstProbability(successProbability)
  return { successChance, success }
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
 * Handles completion of an investigation: creates mission sites, updates agents, marks investigation as successful
 */
function completeInvestigation(
  state: GameState,
  investigation: LeadInvestigation,
  investigatingAgents: Agent[],
  successChance: Bps,
): LeadInvestigationReport {
  // Increment lead investigation count
  const currentCount = state.leadInvestigationCounts[investigation.leadId] ?? 0
  state.leadInvestigationCounts[investigation.leadId] = currentCount + 1

  // Create mission sites for dependent missions
  const createdMissionSites = createMissionSitesForLead(state, investigation.leadId)

  // Mark investigation as successful and clear agent assignments
  investigation.state = 'Successful'
  investigation.agentIds = []

  // Return agents to standby
  for (const agent of investigatingAgents) {
    agent.assignment = 'Standby'
    agent.state = 'InTransit'
  }

  return {
    investigationId: investigation.id,
    leadId: investigation.leadId,
    completed: true,
    accumulatedIntel: investigation.accumulatedIntel,
    successChance,
    createdMissionSites: createdMissionSites.map((site) => site.id),
  }
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

/**
 * Handles continuation of an investigation: applies intel decay and accumulates new intel
 */
function continueInvestigation(
  investigation: LeadInvestigation,
  investigatingAgents: Agent[],
  successChance: Bps,
): LeadInvestigationReport {
  // Apply intel decay (before accumulation)
  const intelDecay = calculateIntelDecayAmount(investigation.accumulatedIntel)
  investigation.accumulatedIntel = Math.max(0, investigation.accumulatedIntel - intelDecay)

  // Accumulate new intel from assigned agents (same formula as espionage)
  const accumulatedIntel = calculateAccumulatedIntel(investigatingAgents)
  investigation.accumulatedIntel += accumulatedIntel

  return {
    investigationId: investigation.id,
    leadId: investigation.leadId,
    completed: false,
    accumulatedIntel: investigation.accumulatedIntel,
    successChance,
    intelDecay,
  }
}
