/* eslint-disable unicorn/prefer-switch */
import type { Agent, AgentId } from '../model/agentModel'
import {
  AGENT_INITIAL_ASSIGNMENT,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_SKILL,
} from '../data_tables/constants'
import { toF6 } from '../primitives/fixed6'
import { bldWeapon } from './weaponFactory'
import { formatAgentId } from '../../redux/reducer_utils/agentIdUtils'

/**
 * Creates a new agent object.
 * Returns the created agent. The caller is responsible for adding it to state.
 */
export function bldAgent(params: CreateAgentParams): Agent {
  const {
    agentCount,
    turnHired,
    weaponDamage,
    id,
    agentState,
    assignment = AGENT_INITIAL_ASSIGNMENT,
    skill = AGENT_INITIAL_SKILL,
    exhaustionPct = AGENT_INITIAL_EXHAUSTION,
    hitPoints = toF6(AGENT_INITIAL_HIT_POINTS),
    maxHitPoints = AGENT_INITIAL_HIT_POINTS,
    missionsTotal = 0,
    skillFromTraining = toF6(0),
    turnTerminated,
    terminatedOnMissionId,
    terminatedBy,
  } = params

  // Generate ID if not provided
  const agentId: AgentId = id ?? formatAgentId(agentCount)

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
    missionsTotal,
    skillFromTraining,
    weapon: bldWeapon(weaponDamage),
    ...(turnTerminated !== undefined && { turnTerminated }),
    ...(terminatedOnMissionId !== undefined && { terminatedOnMissionId }),
    ...(terminatedBy !== undefined && { terminatedBy }),
  }

  return newAgent
}

type CreateAgentParams = {
  agentCount: number
  turnHired: number
  weaponDamage: number
  id?: AgentId // Optional: if not provided, will be auto-generated
  agentState?: Agent['state'] // Optional: defaults based on assignment
  assignment?: Agent['assignment'] // Optional: defaults to AGENT_INITIAL_ASSIGNMENT
  skill?: Agent['skill'] // Optional: defaults to AGENT_INITIAL_SKILL
  exhaustionPct?: number // Optional: defaults to AGENT_INITIAL_EXHAUSTION
  hitPoints?: Agent['hitPoints'] // Optional: defaults to AGENT_INITIAL_HIT_POINTS
  maxHitPoints?: number // Optional: defaults to AGENT_INITIAL_HIT_POINTS
  missionsTotal?: number // Optional: defaults to 0
  skillFromTraining?: Agent['skillFromTraining'] // Optional: defaults to 0
  turnTerminated?: number // Optional
  terminatedOnMissionId?: Agent['terminatedOnMissionId'] // Optional
  terminatedBy?: string // Optional
}
