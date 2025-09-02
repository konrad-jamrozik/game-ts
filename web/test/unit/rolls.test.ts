import { describe, expect, test } from 'vitest'
import { CONTEST_ROLL_PRECISION } from '../../src/lib/model/ruleset/constants'
import { getSuccessAndFailureInts, roll1to, rollAgainstProbability } from '../../src/lib/turn_advancement/rolls'
import { rand } from '../../src/lib/utils/controllableRandom'

describe('rolls', () => {
  test('rollAgainstProbability', () => {
    rand.set('test_label', 1)
    const testCases: [number, number, boolean][] = [
      [1, 0, false], // Roll max = 99.99% (10_000) against 0% probability -> fail
      [1, 0.0001, true], // Roll max = 99.99% (10_000) against 0.01% probability -> success
      [0.9999, 0.0001, true], // Roll 99.99% (10_000) against 0.01% probability -> success
      [0.9998, 0.0001, false], // Roll 99.99% (9_999) against 0.01% probability -> fail
      [0.9998, 0.0002, true], // Roll 99.99% (9_999) against 0.02% probability -> success
      [1, 1, true], // Roll max (10_000) against 100% probability -> success
      [0, 0, false], // Roll min (1) against 0% probability -> fail
      [0.0002, 0.9998, true], // Roll 0.02% (3) against 99.98% probability -> success
      [0.0001, 0.9998, false], // Roll 0.01% (2) against 99.98% probability -> fail
      [0.0001, 0.9999, true], // Roll 0.01% (2) against 99.99% probability -> success
      [0.0001, 1, true], // Roll 0.01% (2) against 100% probability -> success
      [0, 0.9999, false], // Roll min (1) against 99.99% probability -> fail
      [0, 1, true], // Roll min (1) against 100% probability -> success
    ]
    testCases.forEach(([fixedRoll, probability, expectedSuccess]) => {
      rand.set('test_label', fixedRoll)
      const [success] = rollAgainstProbability(probability, 'test_label')
      expect(success).toBe(expectedSuccess)
    })
  })

  test('getSuccessAndFailureInts', () => {
    const testCases: [number, number, number][] = [
      [0, 10_000, 0],
      [0.0001, 9999, 1],
      [0.05, 9500, 500],
      [0.1, 9000, 1000],
      [0.5, 5000, 5000],
      [0.9, 1000, 9000],
      [0.95, 500, 9500],
      [0.9999, 1, 9999],
      [1, 0, 10_000],
    ]
    testCases.forEach(([probability, expectedFailure, expectedSuccess]) => {
      testSuccessAndFailureInts(probability, expectedFailure, expectedSuccess)
    })
  })

  test('roll1to -> max random result is CONTEST_ROLL_PRECISION', () => {
    rand.set('test_label', 1)
    const roll = roll1to(CONTEST_ROLL_PRECISION, 'test_label')
    expect(roll).toBe(CONTEST_ROLL_PRECISION)
  })

  test('roll1to -> min random result is 1', () => {
    rand.set('test_label', 0)
    const roll = roll1to(CONTEST_ROLL_PRECISION, 'test_label')
    expect(roll).toBe(1)
  })
})

// Helper function for testing getSuccessAndFailureInts with different probabilities
function testSuccessAndFailureInts(
  successProbability: number,
  expectedFailureInt: number,
  expectedSuccessInt: number,
): void {
  const [failureInt, successInt] = getSuccessAndFailureInts(successProbability)
  expect(failureInt).toBe(expectedFailureInt)
  expect(successInt).toBe(expectedSuccessInt)
}
