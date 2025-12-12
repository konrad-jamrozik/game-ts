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
  const maxHitPointsF6 = toF6(agent.maxHitPoints)
  if (f6lt(agent.hitPoints, zeroF6) || f6gt(agent.hitPoints, maxHitPointsF6)) {
    throw new Error(`Agent ${agent.id} has invalid hit points: ${f6fmtInt(agent.hitPoints)}/${agent.maxHitPoints}`)
  }
  if (agent.exhaustion < 0) {
    throw new Error(`Agent ${agent.id} has negative exhaustion: ${agent.exhaustion}`)
  }
  if (f6lt(agent.skill, zeroF6)) {
    throw new Error(`Agent ${agent.id} has negative skill: ${f6fmtInt(agent.skill)}`)
  }
  if (f6lt(agent.hitPointsLostBeforeRecovery, zeroF6)) {
    throw new Error(
      `Agent ${agent.id} has negative hitPointsLostBeforeRecovery: ${f6fmtInt(agent.hitPointsLostBeforeRecovery)}`,
    )
  }
  if (agent.maxHitPoints <= 0) {
    throw new Error(`Agent ${agent.id} has non-positive maxHitPoints: ${agent.maxHitPoints}`)
  }
}

function validateTermination(agent: Agent): void {
  const zeroF6 = toF6(0)
  const maxHitPointsF6 = toF6(agent.maxHitPoints)
  if (agent.state === 'KIA') {
    assertEqual(
      agent.assignment,
      'KIA',
      `KIA agent ${agent.id} must have assignment of KIA (got ${agent.assignment})`,
    )
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
      maxHitPointsF6.value,
      `Sacked agent ${agent.id} must have full hit points (${agent.maxHitPoints})`,
    )
    assertEqual(
      agent.hitPointsLostBeforeRecovery.value,
      zeroF6.value,
      `Sacked agent ${agent.id} must have no hitPointsLostBeforeRecovery`,
    )
  }
  if (f6eq(agent.hitPoints, zeroF6)) {
    assertEqual(agent.state, 'KIA', `Agent ${agent.id} with 0 hit points must be KIA`)
  }
}

function validateInjuryAndAssignment(agent: Agent): void {
  const zeroF6 = toF6(0)
  const maxHitPointsF6 = toF6(agent.maxHitPoints)
  if (f6lt(agent.hitPoints, maxHitPointsF6) && f6gt(agent.hitPoints, zeroF6)) {
    assertEqual(
      agent.assignment,
      'Recovery',
      `Agent ${agent.id} is injured (${f6fmtInt(agent.hitPoints)}/${agent.maxHitPoints}) and must be on Recovery assignment`,
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
  const maxHitPointsF6 = toF6(agent.maxHitPoints)
  const lostHitPoints = f6sub(maxHitPointsF6, agent.hitPoints)
  if (!(agent.assignment === 'Recovery' || agent.state === 'Recovering')) {
    return
  }
  const zeroF6 = toF6(0)
  if (f6le(lostHitPoints, zeroF6)) {
    return
  }

  // At the start of recovery (InTransit -> Recovery), we set hitPointsLostBeforeRecovery to lost HP
  if (agent.state === 'InTransit' && agent.assignment === 'Recovery') {
    const expectedImmediateLost = lostHitPoints
    assertEqual(
      agent.hitPointsLostBeforeRecovery.value,
      expectedImmediateLost.value,
      `Agent ${agent.id} should set hitPointsLostBeforeRecovery=${f6fmtInt(expectedImmediateLost)} at start of recovery`,
    )
    return
  }

  // We just check that hitPoints <= maxHitPoints
  // The exact recovery per turn is calculated dynamically based on current recoveryPct
  if (agent.state === 'Recovering' && f6gt(agent.hitPoints, maxHitPointsF6)) {
    throw new Error(`Agent ${agent.id} recovering HP exceeds max: ${f6fmtInt(agent.hitPoints)} > ${agent.maxHitPoints}`)
  }
}

function validateMissionAssignment(agent: Agent, state: GameState): void {
  if (!agent.assignment.startsWith('mission-site-')) {
    return
  }
  const missionSiteId = agent.assignment
  const site = state.missionSites.find((missionSite) => missionSite.id === missionSiteId)
  assertDefined(site, `Agent ${agent.id} is assigned to ${missionSiteId}, but the mission site does not exist`)
}
