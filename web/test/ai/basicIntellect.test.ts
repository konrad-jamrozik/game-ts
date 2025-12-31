import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { bldInitialState } from '../../src/lib/factories/gameStateFactory'
import { delegateTurnsToAIPlayer } from '../../src/ai/delegateTurnToAIPlayer'
import { isGameWon } from '../../src/lib/game_utils/gameStateChecks'
import { rand } from '../../src/lib/primitives/rand'

describe('Basic Intellect AI Player', () => {
  // Store is initialized by setupAITests.ts with undoLimit: 0

  beforeEach(() => {
    const store = getStore()
    // Reset store to clean state and clear undo history
    store.dispatch(ActionCreators.clearHistory())
    store.dispatch(reset())
    store.dispatch(clearEvents())
    // Reset rand overrides
    rand.reset()
  })

  test('AI player wins game within 100 turns with favorable conditions', () => {
    const store = getStore()
    // Arrange: Set up standard initial game state with 100,000 money
    const initialState = bldInitialState()
    const customState = { ...initialState, money: 100_000 }
    store.dispatch(reset({ customState }))
    store.dispatch(clearEvents()) // Clear the reset event

    // Configure rand overrides for successful lead investigations and combat
    // Lead investigations always succeed
    rand.set('lead-investigation', 1)
    // Combat always succeeds: agent attacks always hit, enemy attacks always miss
    rand.set('agent_attack_roll', 1)
    rand.set('enemy_attack_roll', 0)

    // Act: Delegate up to 100 turns to basic intellect AI player
    delegateTurnsToAIPlayer('basic', 100)

    // Assert: Verify game ended in victory
    const finalState = store.getState().undoable.present.gameState
    expect(isGameWon(finalState)).toBe(true)
  })
})
