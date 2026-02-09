import { describe, expect, test } from 'vitest'
import { getStore } from '../../src/redux/store'
import { delegateTurnsToAIPlayer } from '../../src/ai/delegateTurnsToAIPlayer'
import { isGameWon } from '../../src/lib/game_utils/gameStateChecks'
import { getCurrentTurnStateFromStore } from '../../src/redux/storeUtils'
import { setupCheatingGameState } from '../utils/gameStateTestUtils'

describe('Basic Intellect AI Player', () => {
  // Note: as of 2026-01-01 this runs for about 5.8-6.8 seconds, simulating about 220 turns.
  test('AI player wins game within 250 turns while cheating', () => {
    const store = getStore()
    setupCheatingGameState()

    // Act
    delegateTurnsToAIPlayer('basic', 250)

    // Assert: Verify game ended in victory
    const finalState = getCurrentTurnStateFromStore(store)
    expect(isGameWon(finalState)).toBe(true)

    // Print agent count
    const gameState = getCurrentTurnStateFromStore(store)
    console.log(
      `\nAgent count: ${gameState.agents.length}. Terminated: ${gameState.terminatedAgents.length}. Current turn: ${gameState.turn}`,
    )
  })
})
