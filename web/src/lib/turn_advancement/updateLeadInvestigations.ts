import type { GameState, MissionSite, MissionSiteId } from '../model/model'
import { getLeadById } from '../collections/leads'
import { missions } from '../collections/missions'
import { calculateIntelDecayPercent, calculateLeadSuccessChance } from '../model/ruleset/ruleset'
import { agsV } from '../model/agents/AgentsView'
import { rollAgainstProbability } from './rolls'
import { newEnemiesFromSpec } from '../utils/enemyUtils'
import { floor } from '../utils/mathUtils'
import type { LeadInvestigationReport } from '../model/turnReportModel'

// KJA need to thoroughly review updateLeadInvestigations
/**
 * Updates lead investigations: applies decay, accumulates intel, checks for completion
 * Returns reports for each investigation updated
 */
export function updateLeadInvestigations(state: GameState): LeadInvestigationReport[] {
  const reports: LeadInvestigationReport[] = []
  const investigationIds = Object.keys(state.leadInvestigations)

  for (const investigationId of investigationIds) {
    const investigation = state.leadInvestigations[investigationId]
    if (investigation === undefined) {
      // KJA these undefined checks are sus; instead should archive the leads, like missions
      // Skip if investigation was removed
    } else {
      // KJA reason to introduce leadsV
      const lead = getLeadById(investigation.leadId)
      const agents = agsV(state.agents).withIds(investigation.agentIds)

      // Filter to only agents that are actually on this investigation assignment
      const investigatingAgents = agents
        .toAgentArray()
        .filter((agent) => agent.assignment === investigationId && agent.state === 'OnAssignment')

      // Apply intel decay (before accumulation)
      const decayBps = calculateIntelDecayPercent(investigation.accumulatedIntel)
      const decayedIntel = floor((investigation.accumulatedIntel * decayBps) / 10_000)
      investigation.accumulatedIntel = Math.max(0, investigation.accumulatedIntel - decayedIntel)

      // Accumulate new intel from assigned agents (same formula as espionage)
      let intelGathered = 0
      for (const agent of investigatingAgents) {
        const effectiveSkill = agent.skill - agent.exhaustion
        intelGathered += floor((5 * effectiveSkill) / 100) // AGENT_ESPIONAGE_INTEL = 5
      }
      investigation.accumulatedIntel += intelGathered

      // Increment turns investigated
      investigation.turnsInvestigated += 1

      // Calculate success chance
      const successChance = calculateLeadSuccessChance(investigation.accumulatedIntel, lead.difficultyConstant)
      const successProbability = successChance.value / 10_000

      // Roll for completion
      const [success] = rollAgainstProbability(successProbability)

      if (success) {
        // Complete lead: increment leadInvestigationCounts
        const currentCount = state.leadInvestigationCounts[investigation.leadId] ?? 0
        state.leadInvestigationCounts[investigation.leadId] = currentCount + 1

        // Create mission sites (same logic as current investigateLead)
        const dependentMissions = missions.filter((mission) => mission.dependsOn.includes(investigation.leadId))
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
            enemies: newEnemiesFromSpec(mission.enemyUnitsSpec), // Create enemies from spec
          }
          state.missionSites.push(newMissionSite)
          createdMissionSites.push(newMissionSite)
        }

        // Remove investigation from leadInvestigations
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete state.leadInvestigations[investigationId]

        // Update agent assignments (agents return to Available/Standby)
        for (const agent of investigatingAgents) {
          agent.assignment = 'Standby'
          agent.state = 'InTransit' // They'll transition to Available next turn
        }

        // Create report
        reports.push({
          investigationId,
          leadId: investigation.leadId,
          completed: true,
          accumulatedIntel: investigation.accumulatedIntel,
          successChance,
          createdMissionSites: createdMissionSites.map((site) => site.id),
        })
      } else {
        // Investigation continues
        reports.push({
          investigationId,
          leadId: investigation.leadId,
          completed: false,
          accumulatedIntel: investigation.accumulatedIntel,
          successChance,
          intelGathered,
          decayedIntel,
        })
      }
    }
  }

  return reports
}
