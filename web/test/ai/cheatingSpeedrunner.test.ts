import { describe, expect, test } from 'vitest'
import { getStore } from '../../src/redux/store'
import { delegateTurnsToAIPlayer } from '../../src/ai/delegateTurnsToAIPlayer'
import { isGameWon } from '../../src/lib/game_utils/gameStateChecks'
import { getCurrentTurnStateFromStore } from '../../src/redux/storeUtils'
import { setupCheatingGameState } from '../utils/gameStateTestUtils'

describe('Cheating Speedrunner AI Player', () => {
  // Note: as of 2026-04-27 this wins around turn 68 while cheating, in about 4.29 seconds.
  test('AI player wins game within 80 turns while cheating', () => {
    const store = getStore()
    setupCheatingGameState()

    // Act
    delegateTurnsToAIPlayer('cheating-speedrunner', 80)

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
