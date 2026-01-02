// Setup for AI tests with undoLimit: 0 to avoid undo history overhead during long AI simulations
// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeAll, beforeEach } from 'vitest'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { debugConfig } from '../../src/lib/primitives/debugConfig'
import { initStore } from '../../src/redux/store'

// Initialize store with undoLimit: 0 for AI tests (no undo history needed)
// Disable persistence to avoid debounced save race conditions after tests complete
// Disable default middleware for performance
// Set invariant validation frequency to 50 turns for performance
beforeAll(async () => {
  debugConfig.setGameStateInvariantsFrequency(50)
  await initStore({ undoLimit: 0, enablePersistence: false, enableDefaultMiddleware: false })
})

beforeEach(() => {
  resetAllFixtures()
  rand.reset()
  // Reset debugConfig frequency to 50 (in case any test changed it)
  debugConfig.setGameStateInvariantsFrequency(50)
})
