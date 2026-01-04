import type { Fixed6 } from '../primitives/fixed6'
import type { Actor } from './actorModel'
import type { AgentId, LeadInvestigationId, MissionId } from './modelIds'

export type AgentState =
  | 'Available'
  | 'StartingTransit'
  | 'InTransit'
  | 'Recovering'
  | 'Contracting'
  | 'Investigating'
  | 'OnMission'
  | 'InTraining'
  | 'KIA'
  | 'Sacked'

// Assignment types for agents
export type ActivityId = 'Contracting' | 'Training'
// KJA3 "AssignmentState" is misleading, as we have "AgentState". I.e. the "State" suffix.
export type AgentAssignmentState = 'Standby' | 'Recovery' | 'Sacked' | 'KIA'
export type AgentAssignment = ActivityId | MissionId | LeadInvestigationId | AgentAssignmentState

export type Agent = Actor & {
  id: AgentId
  turnHired: number
  turnTerminated?: number
  terminatedOnMissionId?: MissionId
  terminatedBy?: string
  missionsTotal: number
  skillFromTraining: Fixed6
  state: AgentState
  assignment: AgentAssignment
  kills: number
  damageDealt: number
  damageReceived: number
}

export type AgentCombatStats = {
  id: AgentId
  initialEffectiveSkill: Fixed6
  initialCombatRating: number
  skillGained: Fixed6
}
