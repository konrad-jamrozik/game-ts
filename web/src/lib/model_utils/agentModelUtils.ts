import type { AgentAssignment, ActivityId, AgentAssignmentState, AgentId } from '../model/agentModel'
import type { MissionId } from '../model/missionModel'
import type { LeadInvestigationId } from '../model/leadModel'

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

export function assertIsAgentId(id: string): asserts id is AgentId {
  if (!id.startsWith('agent-')) {
    throw new Error(`Invalid agent ID: ${id}`)
  }
}
