import type { Agent, GameState } from '../model/model'
import { assertDefined, assertEqual, assertOneOf } from './assert'

/**
 * Validates invariants for a single agent within the context of a given game state.
 * Throws an Error if an invariant is violated.
 */
export function validateAgentInvariants(agent: Agent, state: GameState): void {
  // hit points are within [0, max]
  if (agent.hitPoints < 0 || agent.hitPoints > agent.maxHitPoints) {
    throw new Error(`Agent ${agent.id} has invalid hit points: ${agent.hitPoints}/${agent.maxHitPoints}`)
  }

  // exhaustion is not negative
  if (agent.exhaustion < 0) {
    throw new Error(`Agent ${agent.id} has negative exhaustion: ${agent.exhaustion}`)
  }

  // skill is non-negative
  if (agent.skill < 0) {
    throw new Error(`Agent ${agent.id} has negative skill: ${agent.skill}`)
  }

  // Terminated agents must have 0 HP; 0 HP implies Terminated
  if (agent.state === 'Terminated') {
    assertEqual(agent.hitPoints, 0, `Terminated agent ${agent.id} must have 0 hit points`)
  }
  if (agent.hitPoints === 0) {
    assertEqual(agent.state, 'Terminated', `Agent ${agent.id} with 0 hit points must be Terminated`)
  }

  // If missing HP (< max), agent must be assigned to Recovery
  if (agent.hitPoints < agent.maxHitPoints && agent.hitPoints > 0) {
    assertEqual(
      agent.assignment,
      'Recovery',
      `Agent ${agent.id} is injured (${agent.hitPoints}/${agent.maxHitPoints}) and must be on Recovery assignment`,
    )
  }

  // If assignment is Recovery, state should reflect recovering or in-transit to recovery
  if (agent.assignment === 'Recovery') {
    assertOneOf(
      agent.state,
      ['Recovering', 'InTransit'],
      `Agent ${agent.id} on Recovery must be in Recovering or InTransit state, got ${agent.state}`,
    )
  }

  // If on a mission-site assignment, the mission site must exist in state
  if (agent.assignment.startsWith('mission-site-')) {
    const missionSiteId = agent.assignment
    const site = state.missionSites.find((s) => s.id === missionSiteId)
    assertDefined(site, `Agent ${agent.id} is assigned to ${missionSiteId}, but the mission site does not exist`)
  }
}
