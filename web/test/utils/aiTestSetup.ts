import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { bldInitialState } from '../../src/lib/factories/gameStateFactory'
import { rand } from '../../src/lib/primitives/rand'

/**
 * Sets up game state with 100,000 money and configures rand overrides
 * for deterministic success.
 *
 * This is used by both the AI tests and AI profiling harness.
 */
export function setupCheatingGameState(): void {
  const store = getStore()
  const customState = { ...bldInitialState(), money: 100_000 }
  store.dispatch(reset({ customState }))
  store.dispatch(clearEvents())

  // Configure for deterministic success
  // Lead investigations always succeed
  // KJA3 -> lead_investigation
  rand.set('lead-investigation', 1)
  // Combat always succeeds: agent attacks always hit, enemy attacks always miss
  rand.set('agent_attack_roll', 1)
  rand.set('enemy_attack_roll', 0)
}
