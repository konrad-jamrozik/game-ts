/* eslint-disable unicorn/prefer-switch */
import type { Agent, AgentId } from '../model/agentModel'
import { AGENT_INITIAL_WEAPON_DAMAGE } from '../data_tables/constants'
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
    assignment = initialAgent.assignment,
    skill = initialAgent.skill,
    exhaustionPct = initialAgent.exhaustionPct,
    hitPoints = initialAgent.hitPoints,
    maxHitPoints = initialAgent.maxHitPoints,
    missionsTotal = initialAgent.missionsTotal,
    skillFromTraining = initialAgent.skillFromTraining,
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

/**
 * Prototype agent with all default values.
 * Used as a reference for initial agent properties.
 */
export const initialAgent: Agent = {
  id: 'agent-proto' as AgentId,
  turnHired: 1,
  state: 'Available',
  assignment: 'Standby',
  skill: toF6(100),
  exhaustionPct: 0,
  hitPoints: toF6(30),
  maxHitPoints: 30,
  missionsTotal: 0,
  skillFromTraining: toF6(0),
  weapon: bldWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
}

type CreateAgentParams = {
  agentCount: number
  turnHired: number
  weaponDamage: number
  id?: AgentId // Optional: if not provided, will be auto-generated
  agentState?: Agent['state'] // Optional: defaults based on assignment
  assignment?: Agent['assignment'] // Optional: defaults to initialAgent.assignment
  skill?: Agent['skill'] // Optional: defaults to initialAgent.skill
  exhaustionPct?: number // Optional: defaults to initialAgent.exhaustionPct
  hitPoints?: Agent['hitPoints'] // Optional: defaults to initialAgent.hitPoints
  maxHitPoints?: number // Optional: defaults to initialAgent.maxHitPoints
  missionsTotal?: number // Optional: defaults to initialAgent.missionsTotal
  skillFromTraining?: Agent['skillFromTraining'] // Optional: defaults to initialAgent.skillFromTraining
  turnTerminated?: number // Optional
  terminatedOnMissionId?: Agent['terminatedOnMissionId'] // Optional
  terminatedBy?: string // Optional
}
