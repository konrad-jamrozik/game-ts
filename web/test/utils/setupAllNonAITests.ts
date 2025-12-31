// Setup for all non-AI tests with default store initialization
// Auto-reset all fixture counters before each test for consistent test isolation
// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { afterEach, beforeAll, beforeEach } from 'vitest'

// Must be imported before any code that uses Dexie (store -> persist -> Dexie)
import 'fake-indexeddb/auto'

import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { cancelPendingSave, initStore } from '../../src/redux/store'

// Initialize store before all tests
// Disable persistence by default to avoid IndexedDB issues in jsdom environment
// Enable it in specific tests that need to test IndexedDB integration
beforeAll(async () => {
  await initStore({ enablePersistence: false })
})

beforeEach(() => {
  resetAllFixtures()
  rand.reset()
})

afterEach(() => {
  // Cancel any pending debounced saves to prevent them from firing after test cleanup
  cancelPendingSave()
})
