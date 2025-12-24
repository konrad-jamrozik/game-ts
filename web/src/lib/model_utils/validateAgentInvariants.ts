import type { Agent } from '../model/agentModel'
import type { GameState } from '../model/gameStateModel'
import { toF6, f6fmtInt, f6lt, f6gt, f6le, f6eq, f6sub } from '../primitives/fixed6'
import { assertDefined, assertEqual, assertOneOf } from '../primitives/assertPrimitives'

export function validateAgentInvariants(agent: Agent, state: GameState): void {
  validateAgentLocalInvariants(agent, state)
  validateMissionAssignment(agent, state)
}

export function validateAgentLocalInvariants(agent: Agent, state?: GameState): void {
  validateBasicStatRanges(agent)
  validateTermination(agent)
  validateInjuryAndAssignment(agent)
  validateRecoveryStateConsistency(agent)
  if (state !== undefined) {
    validateRecoveryMath(agent)
  }
}

/**
 * Validates invariants for a single agent within the context of a given game state.
 * Throws an Error if an invariant is violated.
 */
function validateBasicStatRanges(agent: Agent): void {
  const zeroF6 = toF6(0)
  if (f6lt(agent.hitPoints, zeroF6) || f6gt(agent.hitPoints, agent.maxHitPoints)) {
    throw new Error(
      `Agent ${agent.id} has invalid hit points: ${f6fmtInt(agent.hitPoints)}/${f6fmtInt(agent.maxHitPoints)}`,
    )
  }
  if (f6lt(agent.exhaustionPct, zeroF6)) {
    throw new Error(`Agent ${agent.id} has negative exhaustionPct: ${f6fmtInt(agent.exhaustionPct)}`)
  }
  if (f6lt(agent.skill, zeroF6)) {
    throw new Error(`Agent ${agent.id} has negative skill: ${f6fmtInt(agent.skill)}`)
  }
  if (f6le(agent.maxHitPoints, zeroF6)) {
    throw new Error(`Agent ${agent.id} has non-positive maxHitPoints: ${f6fmtInt(agent.maxHitPoints)}`)
  }
}

function validateTermination(agent: Agent): void {
  const zeroF6 = toF6(0)
  if (agent.state === 'KIA') {
    assertEqual(agent.assignment, 'KIA', `KIA agent ${agent.id} must have assignment of KIA (got ${agent.assignment})`)
    assertEqual(agent.hitPoints.value, zeroF6.value, `KIA agent ${agent.id} must have 0 hit points`)
  }
  if (agent.state === 'Sacked') {
    assertEqual(
      agent.assignment,
      'Sacked',
      `Sacked agent ${agent.id} must have assignment of Sacked (got ${agent.assignment})`,
    )
    assertEqual(
      agent.hitPoints.value,
      agent.maxHitPoints.value,
      `Sacked agent ${agent.id} must have full hit points (${f6fmtInt(agent.maxHitPoints)})`,
    )
  }
  if (f6eq(agent.hitPoints, zeroF6)) {
    assertEqual(agent.state, 'KIA', `Agent ${agent.id} with 0 hit points must be KIA`)
  }
}

function validateInjuryAndAssignment(agent: Agent): void {
  const zeroF6 = toF6(0)
  if (f6lt(agent.hitPoints, agent.maxHitPoints) && f6gt(agent.hitPoints, zeroF6)) {
    assertEqual(
      agent.assignment,
      'Recovery',
      `Agent ${agent.id} is injured (${f6fmtInt(agent.hitPoints)}/${f6fmtInt(agent.maxHitPoints)}) and must be on Recovery assignment`,
    )
  }
}

function validateRecoveryStateConsistency(agent: Agent): void {
  if (agent.assignment === 'Recovery') {
    assertOneOf(
      agent.state,
      ['Recovering', 'InTransit'],
      `Agent ${agent.id} on Recovery must be in Recovering or InTransit state, got ${agent.state}`,
    )
  }
}

function validateRecoveryMath(agent: Agent): void {
  const lostHitPoints = f6sub(agent.maxHitPoints, agent.hitPoints)
  if (!(agent.assignment === 'Recovery' || agent.state === 'Recovering')) {
    return
  }
  const zeroF6 = toF6(0)
  if (f6le(lostHitPoints, zeroF6)) {
    return
  }

  // At the start of recovery (InTransit -> Recovery), agent should be in transit with Recovery assignment
  if (agent.state === 'InTransit' && agent.assignment === 'Recovery') {
    return
  }

  // We just check that hitPoints <= maxHitPoints
  // The exact recovery per turn is calculated dynamically based on current recoveryPct
  if (agent.state === 'Recovering' && f6gt(agent.hitPoints, agent.maxHitPoints)) {
    throw new Error(
      `Agent ${agent.id} recovering HP exceeds max: ${f6fmtInt(agent.hitPoints)} > ${f6fmtInt(agent.maxHitPoints)}`,
    )
  }
}

function validateMissionAssignment(agent: Agent, state: GameState): void {
  if (!agent.assignment.startsWith('mission-')) {
    return
  }
  const missionId = agent.assignment
  const mission = state.missions.find((m) => m.id === missionId)
  assertDefined(mission, `Agent ${agent.id} is assigned to ${missionId}, but the mission does not exist`)
}
