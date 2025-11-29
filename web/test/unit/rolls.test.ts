import { describe, expect, test } from 'vitest'
import { getSuccessAndFailureInts, roll1to } from '../../src/lib/turn_advancement/rolls'
import { rand } from '../../src/lib/utils/rand'

const FIXED6_PRECISION = 1_000_000

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

  test('roll1to -> max random result is FIXED6_PRECISION', () => {
    rand.set('test_label', 0.999_999)
    const roll = roll1to(FIXED6_PRECISION, 'test_label')
    expect(roll).toBe(FIXED6_PRECISION)
  })

  test('roll1to -> (mix minus less than 1 unit of precision) random result is FIXED6_PRECISION-1', () => {
    const oneUnitOfPrecision = 1 / FIXED6_PRECISION
    const rollFixture = 0.999_999 - oneUnitOfPrecision
    expect(rollFixture).toBeCloseTo(0.999_998, 10)
    rand.set('test_label', rollFixture)
    const roll = roll1to(FIXED6_PRECISION, 'test_label')
    expect(roll).toBe(FIXED6_PRECISION - 1)
  })

  test('roll1to -> min random result is 1', () => {
    rand.set('test_label', 0)
    const roll = roll1to(FIXED6_PRECISION, 'test_label')
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
  // Convert expected values from basis points (10_000 = 1.0) to Fixed6 (1_000_000 = 1.0)
  const expectedFailureFixed6 = Math.floor(expectedFailureInt * 100)
  const expectedSuccessFixed6 = Math.floor(expectedSuccessInt * 100)
  expect(failureInt.value).toBe(expectedFailureFixed6)
  expect(successInt.value).toBe(expectedSuccessFixed6)
}
