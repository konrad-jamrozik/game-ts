import type { Agent, GameState } from '../../model/model'
import {
  AGENT_HIRE_COST,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_SKILL,
  AGENT_INITIAL_WEAPON_DAMAGE,
} from '../../model/ruleset/constants'
import { newWeapon } from '../../utils/weaponUtils'
import { asPlayerAction } from './asPlayerAction'

export const hireAgent = asPlayerAction((state: GameState) => {
  const nextAgentNumericId = state.agents.length
  const newAgentId = `agent-${nextAgentNumericId.toString().padStart(3, '0')}`

  const newAgent = newHiredAgent(newAgentId, state.turn)
  state.agents.push(newAgent)
  state.currentTurnTotalHireCost += AGENT_HIRE_COST
})

export const sackAgents = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToSack = action.payload
  for (const agent of state.agents) {
    if (agentIdsToSack.includes(agent.id)) {
      agent.state = 'Terminated'
      agent.assignment = 'Sacked'
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

export const recallAgents = asPlayerAction<string[]>((state: GameState, action) => {
  const agentIdsToRecall = action.payload
  for (const agent of state.agents) {
    if (agentIdsToRecall.includes(agent.id)) {
      agent.assignment = 'Standby'
      agent.state = 'InTransit'
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
    missionsSurvived: 0,
    weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
  }
}
