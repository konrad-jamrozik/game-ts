import { F6Val0, f6add, f6max, f6sub, type Fixed6 } from '../primitives/fixed6'
import type { GameState } from '../model/gameStateModel'

/**
 * Panic ruleset module.
 *
 * In the new faction operations system:
 * - Panic only increases when enemy faction operations succeed (mission not completed or failed)
 * - Panic is reduced by mission rewards (panicReduction)
 * - There is no automatic panic increase from threat levels anymore
 */

/**
 * Apply panic reduction to the game state.
 * Panic cannot go below 0.
 */
export function applyPanicReduction(state: GameState, reduction: Fixed6): Fixed6 {
  const newPanic = f6max(F6Val0, f6sub(state.panic, reduction))
  const actualReduction = f6sub(state.panic, newPanic)
  state.panic = newPanic
  return actualReduction
}

/**
 * Apply panic increase to the game state.
 */
export function applyPanicIncrease(state: GameState, increase: number): void {
  state.panic = f6add(state.panic, increase)
}

/**
 * Get the projected panic after turn advancement.
 * In the new system, panic only changes from faction operations (which happen unpredictably)
 * and mission rewards, so we can't project an exact value.
 * Returns current panic as the baseline.
 */
export function getPanicNewBalance(gameState: GameState): Fixed6 {
  // In the new system, we can't predict panic changes since they depend on
  // whether faction operations occur and whether missions succeed
  return gameState.panic
}
