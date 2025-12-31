// Setup for AI tests with undoLimit: 0 to avoid undo history overhead during long AI simulations
// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeAll, beforeEach } from 'vitest'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { initStore } from '../../src/redux/store'

// Initialize store with undoLimit: 0 for AI tests (no undo history needed)
// Disable persistence to avoid debounced save race conditions after tests complete
beforeAll(async () => {
  await initStore({ undoLimit: 0, enablePersistence: false })
})

beforeEach(() => {
  resetAllFixtures()
  rand.reset()
})
