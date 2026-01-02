import { describe, expect, test, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { delegateTurnsToAIPlayer } from '../../src/ai/delegateTurnsToAIPlayer'
import { isGameWon } from '../../src/lib/game_utils/gameStateChecks'
import { rand } from '../../src/lib/primitives/rand'
import { log } from '../../src/lib/primitives/logger'
import { LOG_CATEGORY_LIST } from '../../src/lib/primitives/logCategories'
import { getCurrentTurnStateFromStore } from '../../src/redux/storeUtils'
import { setupCheatingGameState } from '../utils/aiTestSetup'

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
    // Disable all logs except "game" category
    const logSettings: Partial<Record<string, boolean>> = {}
    for (const category of LOG_CATEGORY_LIST) {
      logSettings[category] = category === 'game' || category === 'general'
    }
    log.syncAll(logSettings)
  })

  // KJA1 make this test faster. See excel, timing tab chart.
  // This test runs for 40-50 seconds, ~220 turns, and reports:
  // SerializableStateInvariantMiddleware took 34ms, which is more than the warning threshold of 32ms.
  // If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
  // It is disabled in production builds, so you don't need to worry about that.
  test('AI player wins game within 250 turns while cheating', () => {
    const store = getStore()
    setupCheatingGameState()

    // Act: Delegate up to 100 turns to basic intellect AI player
    delegateTurnsToAIPlayer('basic', 250)

    // Assert: Verify game ended in victory
    const finalState = getCurrentTurnStateFromStore(store)
    expect(isGameWon(finalState)).toBe(true)

    // Print agent count
    const gameState = getCurrentTurnStateFromStore(store)
    console.log(`\nAgent count: ${gameState.agents.length}`)
  })
})
