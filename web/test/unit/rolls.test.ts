import { describe, expect, test } from 'vitest'
import { getRollF4Probabilities, roll1to } from '../../src/lib/turn_advancement/rolls'
import { rand } from '../../src/lib/utils/rand'
import { FIXED4_PRECISION } from '../../src/lib/model/fixed6'

describe('rolls', () => {
  test(getRollF4Probabilities, () => {
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
      testRollF4Probabilities(probability, expectedFailure, expectedSuccess)
    })
  })

  test('roll1to -> max random result is FIXED4_PRECISION', () => {
    rand.set('test_label', 0.9999)
    const roll = roll1to(FIXED4_PRECISION, 'test_label')
    expect(roll).toBe(FIXED4_PRECISION)
  })

  test('roll1to -> (mix minus less than 1 unit of precision) random result is FIXED4_PRECISION-1', () => {
    const oneUnitOfPrecision = 1 / FIXED4_PRECISION
    const rollFixture = 0.9999 - oneUnitOfPrecision
    expect(rollFixture).toBeCloseTo(0.9998, 10)
    rand.set('test_label', rollFixture)
    const roll = roll1to(FIXED4_PRECISION, 'test_label')
    expect(roll).toBe(FIXED4_PRECISION - 1)
  })

  test('roll1to -> min random result is 1', () => {
    rand.set('test_label', 0)
    const roll = roll1to(FIXED4_PRECISION, 'test_label')
    expect(roll).toBe(1)
  })
})

// Helper function for testing getSuccessAndFailureInts with different probabilities
function testRollF4Probabilities(
  successF4Prob: number,
  expectedFailureProbF4: number,
  expectedSuccessProbF4: number,
): void {
  const [failureProbF4, successProbF4] = getRollF4Probabilities(successF4Prob)
  // Convert expected values from basis points (10_000 = 1.0) to Fixed6 (1_000_000 = 1.0)
  const expectedFailureF4 = Math.floor(expectedFailureProbF4 * 100)
  const expectedSuccessF4 = Math.floor(expectedSuccessProbF4 * 100)
  expect(failureProbF4.value).toBe(expectedFailureF4)
  expect(successProbF4.value).toBe(expectedSuccessF4)
}
