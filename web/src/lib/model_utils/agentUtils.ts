import type { Actor } from '../model/actorModel'
import type { LeadInvestigation } from '../model/leadModel'
import type { Agent, AgentAssignment, ActivityId, AgentAssignmentState } from '../model/agentModel'
import type { LeadInvestigationId, MissionId } from '../model/modelIds'
import { f6c0, f6add, f6max, type Fixed6 } from '../primitives/fixed6'

// Type guard function to determine if an Actor is an Agent
export function isAgent(actor: Actor): actor is Agent {
  return 'turnHired' in actor
}

/**
 * Adds skill points to an agent.
 * Use this function instead of directly modifying agent.skill to centralize skill arithmetic operations.
 */
export function addSkill(agent: Agent, amount: Fixed6): void {
  agent.skill = f6add(agent.skill, amount)
}

/**
 * Adds skill points from training to an agent.
 * Use this function instead of directly modifying agent.skillFromTraining to centralize skill arithmetic operations.
 */
export function addSkillFromTraining(agent: Agent, amount: Fixed6): void {
  agent.skillFromTraining = f6add(agent.skillFromTraining, amount)
}

export function inTransit(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'InTransit')
}

export function available(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Available')
}

// KJA2 delete onAssignment?
export function onAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Contracting' || agent.state === 'Investigating')
}

export function onContractingAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Contracting')
}

export function onInvestigating(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Investigating')
}

export function deployedOnMission(agents: Agent[], missionId: MissionId): Agent[] {
  return agents.filter((agent) => agent.assignment === missionId && agent.state === 'OnMission')
}

export function withIds(agents: Agent[], ids: readonly string[]): Agent[] {
  const idSet = new Set(ids)
  return agents.filter((agent) => idSet.has(agent.id))
}

export function onTrainingAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'InTraining' && agent.assignment === 'Training')
}

export function recallable(agents: Agent[]): Agent[] {
  return agents.filter(
    (agent) =>
      agent.state === 'Contracting' ||
      agent.state === 'Investigating' ||
      (agent.state === 'InTraining' && agent.assignment === 'Training'),
  )
}

export function notAvailable(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state !== 'Available')
}

// KJA2 rename? See also the str message in the caller, validateOnAssignmentAgents
export function notOnAssignment(agents: Agent[]): Agent[] {
  return agents.filter(
    (agent) =>
      agent.state !== 'Contracting' &&
      agent.state !== 'Investigating' &&
      !(agent.state === 'InTraining' && agent.assignment === 'Training'),
  )
}

export function applyExhaustion(agents: Agent[], exhaustion: Fixed6): void {
  for (const agent of agents) {
    agent.exhaustionPct = f6max(f6c0, f6add(agent.exhaustionPct, exhaustion))
  }
}

// KJA2 delete onAssignmentWithAssignmentId?
export function onAssignmentWithAssignmentId(agents: Agent[], assignmentId: string): Agent[] {
  return agents.filter(
    (agent) => agent.assignment === assignmentId && (agent.state === 'Contracting' || agent.state === 'Investigating'),
  )
}

export function inTransitWithAssignmentId(agents: Agent[], assignmentId: string): Agent[] {
  return agents.filter((agent) => agent.assignment === assignmentId && agent.state === 'InTransit')
}

export function onStandbyAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.assignment === 'Standby')
}

export function recovering(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Recovering')
}

export function onRecoveryAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.assignment === 'Recovery')
}

export function investigatingAgents(agents: Agent[], investigation: LeadInvestigation): Agent[] {
  const filteredAgents = withIds(agents, investigation.agentIds)
  return filteredAgents.filter((agent) => agent.assignment === investigation.id && agent.state === 'Investigating')
}

// Type guard functions for agent assignments
export function isActivityAssignment(assignment: AgentAssignment): assignment is ActivityId {
  return assignment === 'Contracting' || assignment === 'Training'
}

export function isMissionAssignment(assignment: AgentAssignment): assignment is MissionId {
  return typeof assignment === 'string' && assignment.startsWith('mission-')
}

export function isLeadInvestigationAssignment(assignment: AgentAssignment): assignment is LeadInvestigationId {
  return typeof assignment === 'string' && assignment.startsWith('investigation-')
}

export function isAssignmentState(assignment: AgentAssignment): assignment is AgentAssignmentState {
  return assignment === 'Standby' || assignment === 'Recovery' || assignment === 'Sacked' || assignment === 'KIA'
}
