// Setup for AI tests with undoLimit: 100 to enable undo history for undo consistency tests
// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeAll, beforeEach } from 'vitest'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { debugConfig } from '../../src/lib/primitives/debugConfig'
import { initStore } from '../../src/redux/store'

// Initialize store with undoLimit: 100 for AI tests (enables undo history for undo consistency tests)
// Disable persistence to avoid debounced save race conditions after tests complete
// Disable default middleware for performance
// Set invariant validation frequency to 50 turns for performance
beforeAll(async () => {
  debugConfig.setGameStateInvariantsFrequency(50)
  await initStore({ undoLimit: 100, enablePersistence: false, enableDefaultMiddleware: false })
})

beforeEach(() => {
  resetAllFixtures()
  rand.reset()
})

// KJA change here the undo limit to 0 and update the tests that need it to set it to more than 0.
