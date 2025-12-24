import type { Actor } from '../model/actorModel'
import type { MissionId } from '../model/missionModel'
import type { LeadInvestigation } from '../model/leadModel'
import type { Agent } from '../model/agentModel'
import { f6add, f6max, toF6, type Fixed6 } from '../primitives/fixed6'

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

export function notTerminated(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state !== 'KIA' && agent.state !== 'Sacked')
}

export function inTransit(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'InTransit')
}

export function terminated(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'KIA')
}

export function available(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'Available')
}

export function onAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'OnAssignment')
}

export function onContractingAssignment(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state === 'OnAssignment' && agent.assignment === 'Contracting')
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
    (agent) => agent.state === 'OnAssignment' || (agent.state === 'InTraining' && agent.assignment === 'Training'),
  )
}

export function notAvailable(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.state !== 'Available')
}

export function notOnAssignment(agents: Agent[]): Agent[] {
  return agents.filter(
    (agent) => agent.state !== 'OnAssignment' && !(agent.state === 'InTraining' && agent.assignment === 'Training'),
  )
}

export function applyExhaustion(agents: Agent[], exhaustion: Fixed6): void {
  const zeroF6 = toF6(0) // KJA1 need global constant for 0 Fixed6.
  for (const agent of agents) {
    agent.exhaustionPct = f6max(zeroF6, f6add(agent.exhaustionPct, exhaustion))
  }
}

export function onAssignmentWithAssignmentId(agents: Agent[], assignmentId: string): Agent[] {
  return agents.filter((agent) => agent.assignment === assignmentId && agent.state === 'OnAssignment')
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
  return onAssignmentWithAssignmentId(filteredAgents, investigation.id)
}
