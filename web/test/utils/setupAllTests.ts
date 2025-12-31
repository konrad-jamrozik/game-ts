// Auto-reset all fixture counters before each test for consistent test isolation
// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeAll, beforeEach } from 'vitest'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { initStore } from '../../src/redux/store'

// Initialize store before all tests
beforeAll(async () => {
  await initStore()
})

beforeEach(() => {
  resetAllFixtures()
  rand.reset()
})
