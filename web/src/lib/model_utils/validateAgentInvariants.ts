import type { Agent } from '../model/agentModel'
import type { GameState } from '../model/gameStateModel'
import { f6c0, f6fmtInt, f6lt, f6gt, f6le, f6eq, f6sub } from '../primitives/fixed6'
import { assertDefined, assertEqual, assertOneOf } from '../primitives/assertPrimitives'
import {
  f6assertAboveZero,
  f6assertEqual,
  f6assertLessThanOrEqual,
  f6assertNonNeg,
  f6assertGreaterThanOrEqual,
} from '../primitives/fixed6assertPrimitives'

export function validateAgentInvariants(agent: Agent, state: GameState): void {
  validateAgentLocalInvariants(agent, state)
  validateMissionAssignment(agent, state)
  validateInvestigationAssignment(agent, state)
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
 *
 * Implementation optimized with assignments to local consts due to being on hot path.
 */
function validateBasicStatRanges(agent: Agent): void {
  const id = agent.id
  const hp = agent.hitPoints
  const maxHp = agent.maxHitPoints
  const exhaustionPct = agent.exhaustionPct
  const skill = agent.skill
  const f6fmtHp = f6fmtInt(hp)
  const f6fmtMaxHp = f6fmtInt(maxHp)
  const f6fmtExhaustionPct = f6fmtInt(exhaustionPct)
  const f6fmtSkill = f6fmtInt(skill)
  f6assertGreaterThanOrEqual(hp, f6c0, `Agent ${id} has invalid hit points: ${f6fmtHp}/${f6fmtMaxHp}`)
  f6assertLessThanOrEqual(hp, maxHp, `Agent ${id} has invalid hit points: ${f6fmtHp}/${f6fmtMaxHp}`)
  f6assertNonNeg(exhaustionPct, `Agent ${id} has negative exhaustionPct: ${f6fmtExhaustionPct}`)
  f6assertNonNeg(skill, `Agent ${id} has negative skill: ${f6fmtSkill}`)
  f6assertAboveZero(maxHp, `Agent ${id} has non-positive maxHitPoints: ${f6fmtMaxHp}`)
}

function validateTermination(agent: Agent): void {
  if (agent.state === 'KIA') {
    assertEqual(agent.assignment, 'KIA', `KIA agent ${agent.id} must have assignment of KIA (got ${agent.assignment})`)
    f6assertEqual(agent.hitPoints, f6c0, `KIA agent ${agent.id} must have 0 hit points`)
  }
  if (agent.state === 'Sacked') {
    assertEqual(
      agent.assignment,
      'Sacked',
      `Sacked agent ${agent.id} must have assignment of Sacked (got ${agent.assignment})`,
    )
    f6assertEqual(
      agent.hitPoints,
      agent.maxHitPoints,
      `Sacked agent ${agent.id} must have full hit points (${f6fmtInt(agent.maxHitPoints)})`,
    )
  }
  if (f6eq(agent.hitPoints, f6c0)) {
    assertEqual(agent.state, 'KIA', `Agent ${agent.id} with 0 hit points must be KIA`)
  }
}

function validateInjuryAndAssignment(agent: Agent): void {
  if (f6lt(agent.hitPoints, agent.maxHitPoints) && f6gt(agent.hitPoints, f6c0)) {
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
  if (f6le(lostHitPoints, f6c0)) {
    return
  }

  // At the start of recovery (InTransit -> Recovery), agent should be in transit with Recovery assignment
  if (agent.state === 'InTransit' && agent.assignment === 'Recovery') {
    return
  }

  // We just check that hitPoints <= maxHitPoints
  // The exact recovery per turn is calculated dynamically based on current recoveryPct
  if (agent.state === 'Recovering') {
    f6assertLessThanOrEqual(
      agent.hitPoints,
      agent.maxHitPoints,
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

function validateInvestigationAssignment(agent: Agent, state: GameState): void {
  if (!agent.assignment.startsWith('investigation-')) {
    return
  }
  const investigationId = agent.assignment
  const investigation = state.leadInvestigations[investigationId]
  assertDefined(
    investigation,
    `Agent ${agent.id} is assigned to ${investigationId}, but the investigation does not exist`,
  )

  // If agent is OnAssignment to an investigation, the investigation must be Active
  if (agent.state === 'OnAssignment') {
    assertEqual(
      investigation.state,
      'Active',
      `Agent ${agent.id} is OnAssignment to ${investigationId} but investigation state is ${investigation.state}`,
    )
  }
}
