// Auto-reset all fixture counters before each test for consistent test isolation
// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeAll, beforeEach } from 'vitest'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { getCachedStore } from '../fixtures/stateFixture'

// Initialize store before all tests (lazy init will happen on first getStore() call)
// This ensures stateFixture can access the store synchronously
beforeAll(async () => {
  // Cache the store for stateFixture
  await getCachedStore()
})

beforeEach(() => {
  resetAllFixtures()
  rand.reset()
})
