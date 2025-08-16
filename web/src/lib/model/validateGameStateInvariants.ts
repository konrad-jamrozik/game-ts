import type { GameState } from './model'
import { validateAgentInvariants } from './agents/validateAgentInvariants'

/**
 * Validates the entire game state invariants.
 * Throws an Error if any invariant is violated.
 */
export function validateGameStateInvariants(state: GameState): void {
  // Validate all agents
  for (const agent of state.agents) {
    validateAgentInvariants(agent, state)
  }
}
