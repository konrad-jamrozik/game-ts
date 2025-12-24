import type { Fixed6 } from '../primitives/fixed6'
import type { Actor } from './actorModel'
import type { MissionId } from './missionModel'
import type { LeadInvestigationId } from './leadModel'

export type AgentId = `agent-${string}`

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
}

export type AgentCombatStats = {
  id: AgentId
  initialEffectiveSkill: Fixed6
  skillGained: Fixed6
}
