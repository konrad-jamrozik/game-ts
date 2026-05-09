import type { Agent } from '../model/agentModel'
import { f6ge, f6lt, toF6, type Fixed6 } from '../primitives/fixed6'

/** Matches Leads/Missions "Exhausted" toolbar: agents at or above this exhaustion are not Ready. */
export const LEADS_PANEL_READY_MAX_EXHAUSTION_PCT: Fixed6 = toF6(30)

export function isAssignableStandbyOrTrainingAssignment(agent: Agent): boolean {
  return agent.assignment === 'Standby' || agent.assignment === 'Training'
}

/**
 * Leads panel `Ready`: Standby or Training assignment, not InTransit, exhaustion strictly below 30%.
 * InTraining state with Training assignment qualifies when not transiting.
 */
export function isReadyAgentForLeadsPanel(agent: Agent): boolean {
  return (
    isAssignableStandbyOrTrainingAssignment(agent) &&
    agent.state !== 'InTransit' &&
    f6lt(agent.exhaustionPct, LEADS_PANEL_READY_MAX_EXHAUSTION_PCT)
  )
}

/** Leads panel `Exhausted` filter bucket (assignable standby/training, not transiting, exhaustion at or above 30%). */
export function isExhaustedAgentForLeadsPanel(agent: Agent): boolean {
  return (
    isAssignableStandbyOrTrainingAssignment(agent) &&
    agent.state !== 'InTransit' &&
    f6ge(agent.exhaustionPct, LEADS_PANEL_READY_MAX_EXHAUSTION_PCT)
  )
}

/** Leads panel `Away` filter bucket. */
export function isAwayAgentForLeadsPanel(agent: Agent): boolean {
  return (
    agent.assignment !== 'Recovery' &&
    (agent.state === 'InTransit' ||
      agent.state === 'Contracting' ||
      agent.state === 'Investigating' ||
      agent.state === 'OnMission')
  )
}

/** Leads panel `Recovering` filter. */
export function isRecoveringAgentForLeadsPanel(agent: Agent): boolean {
  return agent.state === 'Recovering'
}

/** Player-facing reason an agent cannot be deployed; empty when ready per Leads panel rules. */
export function getMissionAgentUnavailableReason(agent: Agent): string {
  if (isReadyAgentForLeadsPanel(agent)) {
    return ''
  }
  if (isRecoveringAgentForLeadsPanel(agent) || agent.assignment === 'Recovery') {
    return 'Recovering'
  }
  if (agent.state === 'InTransit') {
    return 'In transit'
  }
  if (agent.state === 'OnMission') {
    return 'On mission'
  }
  if (agent.state === 'Investigating') {
    return 'Investigating'
  }
  if (isExhaustedAgentForLeadsPanel(agent)) {
    return 'Exhausted'
  }
  if (agent.state === 'InTraining' && agent.assignment === 'Training') {
    return 'Training'
  }
  if (agent.state === 'Contracting') {
    return 'Away'
  }
  return 'Away'
}
