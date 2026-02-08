// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeAll, beforeEach } from 'vitest'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { debugConfig } from '../../src/lib/primitives/debugConfig'
import { initStore } from '../../src/redux/store'

beforeAll(async () => {
  // Set invariant validation frequency to 50 turns for performance
  debugConfig.setGameStateInvariantsFrequency(50)
  // Initialize store for AI tests with undoLimit: 0 to avoid undo history overhead during long AI simulations
  // Disable persistence to avoid debounced save race conditions after tests complete
  // Disable default middleware for performance
  await initStore({ undoLimit: 0, enablePersistence: false, enableDefaultMiddleware: false })
})

beforeEach(() => {
  resetAllFixtures()
  rand.reset()
})
