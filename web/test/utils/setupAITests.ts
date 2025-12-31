// Setup for AI tests with undoLimit: 0 to avoid undo history overhead during long AI simulations
// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeAll, beforeEach } from 'vitest'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { initStore } from '../../src/redux/store'

// Mock IndexedDB for tests
import 'fake-indexeddb/auto'

// Initialize store with undoLimit: 0 for AI tests (no undo history needed)
beforeAll(async () => {
  await initStore({ undoLimit: 0 })
})

beforeEach(() => {
  resetAllFixtures()
  rand.reset()
})
