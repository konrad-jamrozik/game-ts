// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeAll, beforeEach } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'
import { rand } from '../../src/lib/primitives/rand'
import { debugConfig } from '../../src/lib/primitives/debugConfig'
import { initStore, getStore } from '../../src/redux/store'
import { reset } from '../../src/redux/slices/gameStateSlice'
import { log } from '../../src/lib/primitives/logger'
import { LOG_CATEGORY_LIST } from '../../src/lib/primitives/logCategories'

beforeAll(async () => {
  // Set invariant validation frequency to 50 turns for performance
  debugConfig.setGameStateInvariantsFrequency(50)
  // Initialize store for AI tests with undoLimit: 10 to avoid undo history overhead during long AI simulations.
  // But still need some small amount of undo history as some tests exercise undo logic.
  // Disable persistence to avoid debounced save race conditions after tests complete
  // Disable default middleware for performance
  // ⚠️ Per Opus 4.6, apparently redux-undo treats "undoLimit: 0" as "no limit" so 1 is the lowest valid value.
  await initStore({ undoLimit: 10, enablePersistence: false, enableDefaultMiddleware: false })
})

beforeEach(() => {
  const store = getStore()
  // Reset store to clean state and clear undo history
  store.dispatch(ActionCreators.clearHistory())
  store.dispatch(reset())
  resetAllFixtures()
  rand.reset()
  // Disable all logs
  const logSettings: Partial<Record<string, boolean>> = {}
  for (const category of LOG_CATEGORY_LIST) {
    logSettings[category] = false
  }
  log.setAll(logSettings)
})
