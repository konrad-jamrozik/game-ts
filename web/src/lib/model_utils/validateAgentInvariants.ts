import type { Agent, GameState } from '../model/model'
import { toF6, f6fmtInt } from '../utils/fixed6Utils'
import { f6lt } from '../primitives/fixed6Primitives'
import { assertDefined, assertEqual, assertOneOf } from '../primitives/assertPrimitives'
import { ceil, div } from '../primitives/mathPrimitives'

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
    validateRecoveryMath(agent, state)
  }
}

/**
 * Validates invariants for a single agent within the context of a given game state.
 * Throws an Error if an invariant is violated.
 */
function validateBasicStatRanges(agent: Agent): void {
  if (agent.hitPoints < 0 || agent.hitPoints > agent.maxHitPoints) {
    throw new Error(`Agent ${agent.id} has invalid hit points: ${agent.hitPoints}/${agent.maxHitPoints}`)
  }
  if (agent.exhaustion < 0) {
    throw new Error(`Agent ${agent.id} has negative exhaustion: ${agent.exhaustion}`)
  }
  if (f6lt(agent.skill, toF6(0))) {
    throw new Error(`Agent ${agent.id} has negative skill: ${f6fmtInt(agent.skill)}`)
  }
  if (agent.hitPointsLostBeforeRecovery < 0) {
    throw new Error(`Agent ${agent.id} has negative hitPointsLostBeforeRecovery: ${agent.hitPointsLostBeforeRecovery}`)
  }
  if (agent.recoveryTurns < 0) {
    throw new Error(`Agent ${agent.id} has negative recoveryTurns: ${agent.recoveryTurns}`)
  }
  if (agent.maxHitPoints <= 0) {
    throw new Error(`Agent ${agent.id} has non-positive maxHitPoints: ${agent.maxHitPoints}`)
  }
}

function validateTermination(agent: Agent): void {
  if (agent.state === 'Terminated') {
    assertOneOf(
      agent.assignment,
      ['Sacked', 'KIA'],
      `Terminated agent ${agent.id} must have assignment of Sacked or KIA (got ${agent.assignment})`,
    )
    if (agent.assignment === 'KIA') {
      assertEqual(agent.hitPoints, 0, `KIA agent ${agent.id} must have 0 hit points`)
    }
    if (agent.assignment === 'Sacked') {
      assertEqual(
        agent.hitPoints,
        agent.maxHitPoints,
        `Sacked agent ${agent.id} must have full hit points (${agent.maxHitPoints})`,
      )
      assertEqual(agent.recoveryTurns, 0, `Sacked agent ${agent.id} must have no recovery turns`)
      assertEqual(
        agent.hitPointsLostBeforeRecovery,
        0,
        `Sacked agent ${agent.id} must have no hitPointsLostBeforeRecovery`,
      )
    }
  }
  if (agent.hitPoints === 0) {
    assertEqual(agent.state, 'Terminated', `Agent ${agent.id} with 0 hit points must be Terminated`)
  }
}

function validateInjuryAndAssignment(agent: Agent): void {
  if (agent.hitPoints < agent.maxHitPoints && agent.hitPoints > 0) {
    assertEqual(
      agent.assignment,
      'Recovery',
      `Agent ${agent.id} is injured (${agent.hitPoints}/${agent.maxHitPoints}) and must be on Recovery assignment`,
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

function validateRecoveryMath(agent: Agent, state: GameState): void {
  const lostHitPoints = agent.maxHitPoints - agent.hitPoints
  if (!(agent.assignment === 'Recovery' || agent.state === 'Recovering')) {
    return
  }
  if (lostHitPoints <= 0) {
    return
  }

  const { hitPointsRecoveryPct } = state
  const expectedTotalRecoveryTurns = ceil(
    (div(agent.hitPointsLostBeforeRecovery, agent.maxHitPoints) * 100) / hitPointsRecoveryPct,
  )

  // At the start of recovery (InTransit -> Recovery), we set hitPointsLostBeforeRecovery to lost HP and recoveryTurns to total
  if (agent.state === 'InTransit' && agent.assignment === 'Recovery') {
    const expectedImmediateLost = lostHitPoints
    assertEqual(
      agent.hitPointsLostBeforeRecovery,
      expectedImmediateLost,
      `Agent ${agent.id} should set hitPointsLostBeforeRecovery=${expectedImmediateLost} at start of recovery`,
    )
    const expectedImmediateRecoveryTurns = ceil(
      (div(expectedImmediateLost, agent.maxHitPoints) * 100) / hitPointsRecoveryPct,
    )
    assertEqual(
      agent.recoveryTurns,
      expectedImmediateRecoveryTurns,
      `Agent ${agent.id} should set recoveryTurns=${expectedImmediateRecoveryTurns} at start of recovery`,
    )
    return
  }

  if (agent.state === 'Recovering') {
    if (agent.recoveryTurns <= 0 || agent.recoveryTurns > expectedTotalRecoveryTurns) {
      throw new Error(
        `Agent ${agent.id} has invalid recoveryTurns=${agent.recoveryTurns} (expected 1..${expectedTotalRecoveryTurns})`,
      )
    }

    const turnsCompleted = expectedTotalRecoveryTurns - agent.recoveryTurns
    const hitPointsPerTurn = div(agent.hitPointsLostBeforeRecovery, expectedTotalRecoveryTurns)
    const restoredSoFar = Math.floor(hitPointsPerTurn * turnsCompleted)
    const expectedHitPoints = agent.maxHitPoints - agent.hitPointsLostBeforeRecovery + restoredSoFar
    assertEqual(
      agent.hitPoints,
      expectedHitPoints,
      `Agent ${agent.id} recovering HP mismatch: expected ${expectedHitPoints}, got ${agent.hitPoints}`,
    )
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
