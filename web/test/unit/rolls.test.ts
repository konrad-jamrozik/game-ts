import { describe, expect, test } from 'vitest'
import { BPS_PRECISION } from '../../src/lib/model/bps'
import { getSuccessAndFailureInts, roll1to } from '../../src/lib/turn_advancement/rolls'
import { rand } from '../../src/lib/utils/rand'

describe('rolls', () => {
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
    rand.set('test_label', 0.9999)
    const roll = roll1to(BPS_PRECISION, 'test_label')
    expect(roll).toBe(BPS_PRECISION)
  })

  test('roll1to -> (mix minus less than 1 unit of precision) random result is CONTEST_ROLL_PRECISION-1', () => {
    const precisionTimes10Fraction = 1 / (10 * BPS_PRECISION)
    const rollFixture = 0.9999 - precisionTimes10Fraction
    expect(rollFixture).toBeCloseTo(0.999_89, 10)
    rand.set('test_label', rollFixture)
    const roll = roll1to(BPS_PRECISION, 'test_label')
    expect(roll).toBe(BPS_PRECISION - 1)
  })

  test('roll1to -> min random result is 1', () => {
    rand.set('test_label', 0)
    const roll = roll1to(BPS_PRECISION, 'test_label')
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
  expect(failureInt.value).toBe(expectedFailureInt)
  expect(successInt.value).toBe(expectedSuccessInt)
}
