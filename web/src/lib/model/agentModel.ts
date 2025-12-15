import type { Fixed6 } from '../primitives/fixed6'
import type { Actor, MissionId } from './missionModel'
import type { LeadInvestigationId } from './leadModel'

export type AgentState =
  | 'Available'
  | 'StartingTransit'
  | 'InTransit'
  | 'Recovering'
  | 'OnAssignment'
  | 'OnMission'
  | 'InTraining'
  | 'KIA'
  | 'Sacked'

// Assignment types for agents
export type ActivityId = 'Contracting' | 'Training'
export type AgentAssignmentState = 'Standby' | 'Recovery' | 'Sacked' | 'KIA'
export type AgentAssignment = ActivityId | MissionId | LeadInvestigationId | AgentAssignmentState

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

export type Agent = Actor & {
  turnHired: number
  turnTerminated?: number
  terminatedOnMissionId?: MissionId
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
