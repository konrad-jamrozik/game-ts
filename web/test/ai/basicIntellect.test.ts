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
      logSettings[category] = false // category === 'game' || category === 'general'
    }
    log.syncAll(logSettings)
  })

  // Note: as of 2026-01-01 this runs for about 5.8-6.8 seconds, simulating about 220 turns.
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
    console.log(`\nAgent count: ${gameState.agents.length}. Terminated: ${gameState.terminatedAgents.length}`)
  })
})
