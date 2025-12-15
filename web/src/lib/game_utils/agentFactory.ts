/* eslint-disable unicorn/prefer-switch */
import type { GameState } from '../model/gameStateModel'
import type { Agent, AgentId } from '../model/agentModel'
import { AGENT_INITIAL_EXHAUSTION, AGENT_INITIAL_HIT_POINTS, AGENT_INITIAL_SKILL } from '../ruleset/constants'
import { toF6 } from '../primitives/fixed6'
import { bldWeapon } from '../ruleset/weaponRuleset'
import { formatAgentId } from '../../redux/reducer_utils/agentIdUtils'

type CreateAgentParams = {
  state: GameState
  turnHired: number
  weaponDamage: number
  id?: AgentId // Optional: if not provided, will be auto-generated
  agentState?: Agent['state'] // Optional: defaults based on assignment
  assignment?: Agent['assignment'] // Optional: defaults to 'Standby'
  skill?: Agent['skill'] // Optional: defaults to AGENT_INITIAL_SKILL
  exhaustionPct?: number // Optional: defaults to AGENT_INITIAL_EXHAUSTION
  hitPoints?: Agent['hitPoints'] // Optional: defaults to AGENT_INITIAL_HIT_POINTS
  maxHitPoints?: number // Optional: defaults to AGENT_INITIAL_HIT_POINTS
  hitPointsLostBeforeRecovery?: Agent['hitPointsLostBeforeRecovery'] // Optional: defaults to 0
  missionsTotal?: number // Optional: defaults to 0
  skillFromTraining?: Agent['skillFromTraining'] // Optional: defaults to 0
  turnTerminated?: number // Optional
  terminatedOnMissionId?: Agent['terminatedOnMissionId'] // Optional
  terminatedBy?: string // Optional
}

/**
 * Creates a new agent and adds it to the game state.
 * Returns the created agent.
 */
export function bldAgent(params: CreateAgentParams): Agent {
  const {
    state,
    turnHired,
    weaponDamage,
    id: providedId,
    agentState,
    assignment = 'Standby',
    skill = AGENT_INITIAL_SKILL,
    exhaustionPct = AGENT_INITIAL_EXHAUSTION,
    hitPoints = toF6(AGENT_INITIAL_HIT_POINTS),
    maxHitPoints = AGENT_INITIAL_HIT_POINTS,
    hitPointsLostBeforeRecovery = toF6(0),
    missionsTotal = 0,
    skillFromTraining = toF6(0),
    turnTerminated,
    terminatedOnMissionId,
    terminatedBy,
  } = params

  // Generate ID if not provided
  const agentId: AgentId = providedId ?? formatAgentId(state.agents.length)

  // Determine agent state if not provided
  let finalAgentState: Agent['state'] = 'Available'
  if (agentState !== undefined) {
    finalAgentState = agentState
  } else if (assignment === 'Training') {
    finalAgentState = 'InTraining'
  } else if (assignment === 'Contracting') {
    finalAgentState = 'InTransit'
  } else if (assignment === 'Standby') {
    finalAgentState = 'Available'
  }

  const newAgent: Agent = {
    id: agentId,
    turnHired,
    state: finalAgentState,
    assignment,
    skill,
    exhaustionPct,
    hitPoints,
    maxHitPoints,
    hitPointsLostBeforeRecovery,
    missionsTotal,
    skillFromTraining,
    weapon: bldWeapon(weaponDamage),
    ...(turnTerminated !== undefined && { turnTerminated }),
    ...(terminatedOnMissionId !== undefined && { terminatedOnMissionId }),
    ...(terminatedBy !== undefined && { terminatedBy }),
  }

  state.agents.push(newAgent)

  return newAgent
}

type CreateAgentWithoutStateParams = Omit<CreateAgentParams, 'state' | 'id'> & {
  id: AgentId
}

// KJA3 silly duplication of bldAgent
/**
 * Creates an agent object without adding it to state.
 * Useful for test fixtures and other cases where you need an agent object but don't want to modify state.
 */
export function bldAgentWithoutState(params: CreateAgentWithoutStateParams): Agent {
  const {
    id: agentId,
    turnHired,
    weaponDamage,
    agentState,
    assignment = 'Standby',
    skill = AGENT_INITIAL_SKILL,
    exhaustionPct = AGENT_INITIAL_EXHAUSTION,
    hitPoints = toF6(AGENT_INITIAL_HIT_POINTS),
    maxHitPoints = AGENT_INITIAL_HIT_POINTS,
    hitPointsLostBeforeRecovery = toF6(0),
    missionsTotal = 0,
    skillFromTraining = toF6(0),
    turnTerminated,
    terminatedOnMissionId,
    terminatedBy,
  } = params

  // Determine agent state if not provided
  let finalAgentState: Agent['state'] = 'Available'
  if (agentState !== undefined) {
    finalAgentState = agentState
  } else if (assignment === 'Training') {
    finalAgentState = 'InTraining'
  } else if (assignment === 'Contracting') {
    finalAgentState = 'InTransit'
  } else if (assignment === 'Standby') {
    finalAgentState = 'Available'
  }

  return {
    id: agentId,
    turnHired,
    state: finalAgentState,
    assignment,
    skill,
    exhaustionPct,
    hitPoints,
    maxHitPoints,
    hitPointsLostBeforeRecovery,
    missionsTotal,
    skillFromTraining,
    weapon: bldWeapon(weaponDamage),
    ...(turnTerminated !== undefined && { turnTerminated }),
    ...(terminatedOnMissionId !== undefined && { terminatedOnMissionId }),
    ...(terminatedBy !== undefined && { terminatedBy }),
  }
}
