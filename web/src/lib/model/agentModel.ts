import type { Fixed6 } from '../primitives/fixed6'
import type { Actor, MissionSiteId, LeadInvestigationId } from './model'

export type AgentState =
  | 'Available'
  | 'StartingTransit'
  | 'InTransit'
  | 'Recovering'
  | 'OnAssignment'
  | 'OnMission'
  | 'InTraining'
  | 'Terminated'

// Assignment types for agents
export type ActivityId = 'Contracting' | 'Espionage' | 'Training'
export type AgentAssignmentState = 'Standby' | 'Recovery' | 'Sacked' | 'KIA'
export type AgentAssignment = ActivityId | MissionSiteId | LeadInvestigationId | AgentAssignmentState

// Type guard functions for agent assignments
export function isActivityAssignment(assignment: AgentAssignment): assignment is ActivityId {
  return assignment === 'Contracting' || assignment === 'Espionage' || assignment === 'Training'
}

export function isMissionSiteAssignment(assignment: AgentAssignment): assignment is MissionSiteId {
  return typeof assignment === 'string' && assignment.startsWith('mission-site-')
}

export function isLeadInvestigationAssignment(assignment: AgentAssignment): assignment is LeadInvestigationId {
  return typeof assignment === 'string' && assignment.startsWith('investigation-')
}

export function isAssignmentState(assignment: AgentAssignment): assignment is AgentAssignmentState {
  return assignment === 'Standby' || assignment === 'Recovery' || assignment === 'Sacked' || assignment === 'KIA'
}

export type Agent = Actor & {
  turnHired: number
  turnTerminated?: number
  terminatedOnMissionSiteId?: MissionSiteId
  terminatedBy?: string
  hitPointsLostBeforeRecovery: Fixed6
  missionsTotal: number
  skillFromTraining: Fixed6
  state: AgentState
  assignment: AgentAssignment
}

export type AgentCombatStats = {
  id: string
  initialEffectiveSkill: Fixed6
  skillGained: Fixed6
}
