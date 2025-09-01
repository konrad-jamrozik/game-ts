// Auto-reset all fixture counters before each test for consistent test isolation
// Disable eslint warning as this is global setup test file that is expected
// to have beforeEach outside of describe blocks.
/* eslint-disable vitest/require-top-level-describe */
import { beforeEach } from 'vitest'
import { resetAllFixtures } from '../fixtures/resetAllFixtures'

beforeEach(() => {
  resetAllFixtures()
})
