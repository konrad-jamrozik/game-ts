import type { Agent, GameState } from '../../model/model'
import { agV } from '../../model/agents/AgentView'
import {
  AGENT_HIRE_COST,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_SKILL,
  AGENT_INITIAL_WEAPON_DAMAGE,
} from '../../model/ruleset/constants'
import { toF2 } from '../../model/fixed2'
import { newWeapon } from '../../utils/weaponUtils'
import { asPlayerAction } from './asPlayerAction'

export const hireAgent = asPlayerAction((state: GameState) => {
  const nextAgentNumericId = state.agents.length
  const newAgentId = `agent-${nextAgentNumericId.toString().padStart(3, '0')}`

  const newAgent = newHiredAgent(newAgentId, state.turn)
  state.agents.push(newAgent)
  state.money -= AGENT_HIRE_COST
})

export const sackAgents = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToSack = action.payload
  for (const agent of state.agents) {
    if (agentIdsToSack.includes(agent.id)) {
      agent.state = 'Terminated'
      agent.assignment = 'Sacked'
      agent.turnTerminated = state.turn
    }
  }
})

export const assignAgentsToContracting = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToAssign = action.payload
  for (const agent of state.agents) {
    if (agentIdsToAssign.includes(agent.id)) {
      agent.assignment = 'Contracting'
      agent.state = 'InTransit'
    }
  }
})

export const assignAgentsToEspionage = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToAssign = action.payload
  for (const agent of state.agents) {
    if (agentIdsToAssign.includes(agent.id)) {
      agent.assignment = 'Espionage'
      agent.state = 'InTransit'
    }
  }
})

export const assignAgentsToTraining = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToAssign = action.payload
  for (const agent of state.agents) {
    if (agentIdsToAssign.includes(agent.id)) {
      agent.assignment = 'Training'
      agent.state = 'InTraining'
    }
  }
})

export const recallAgents = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToRecall = action.payload
  for (const agent of state.agents) {
    if (agentIdsToRecall.includes(agent.id)) {
      // Check if agent is assigned to a lead investigation
      const isLeadInvestigation = typeof agent.assignment === 'string' && agent.assignment.startsWith('investigation-')
      if (isLeadInvestigation) {
        // Remove agent from investigation
        const investigationId = agent.assignment
        const investigation = state.leadInvestigations[investigationId]
        if (investigation !== undefined) {
          investigation.agentIds = investigation.agentIds.filter((id) => id !== agent.id)
          // If all agents are recalled, mark investigation as Abandoned
          if (investigation.agentIds.length === 0) {
            investigation.state = 'Abandoned'
          }
        }
      }
      // Check if agent is in training before changing assignment
      const isTraining = agV(agent).isOnTrainingAssignment()
      agent.assignment = 'Standby'
      // Training agents go directly to Available (no transit needed)
      if (isTraining) {
        agent.state = 'Available'
      } else {
        // Other assignments (Contracting, Espionage, Lead Investigation) go to InTransit
        agent.state = 'InTransit'
      }
    }
  }
})

/**
 * Creates a new hired agent with the standard initial values used in the hiring process.
 */
export function newHiredAgent(id: string, turnHired: number): Agent {
  return {
    id,
    turnHired,
    state: 'InTransit',
    assignment: 'Standby',
    skill: AGENT_INITIAL_SKILL,
    exhaustion: AGENT_INITIAL_EXHAUSTION,
    hitPoints: AGENT_INITIAL_HIT_POINTS,
    maxHitPoints: AGENT_INITIAL_HIT_POINTS,
    recoveryTurns: 0,
    hitPointsLostBeforeRecovery: 0,
    missionsTotal: 0,
    skillFromTraining: toF2(0),
    weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
  }
}
