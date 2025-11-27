import { describe, expect, test } from 'vitest'
import { BPS_PRECISION } from '../../src/lib/model/bps'
import { getSuccessAndFailureInts, roll1to, rollAgainstProbability } from '../../src/lib/turn_advancement/rolls'
import { rand } from '../../src/lib/utils/rand'

describe('rolls', () => {
  test('rollAgainstProbability', () => {
    // Note:
    // Probability of 0 will cause the roll to always fail, Success = Roll > 10_000 -> impossible.
    // Probability of 1 will cause the roll to always succeed. Failure = Roll <= 0 -> impossible.
    //
    // Note: probability of 1 in the test cases below is in fact 0.(9) - see rand.ts for details.
    // prettier-ignore
    const testCases: [number, number, boolean][] = [
      [0,      0,      false ], // { probability: 0,       roll: 1,     failureInt: 10000, success: false }
      [0,      0.9999, false ], // { probability: 0,       roll: 10000, failureInt: 10000, success: false }
      [0.0001, 0.9998, false ], // { probability: 0.0001,  roll: 9999,  failureInt: 9999,  success: false }
      [0.0001, 0.9999, true  ], // { probability: 0.0001,  roll: 10000, failureInt: 9999,  success: true  }
      [0.0001, 1,      true  ], // { probability: 0.0001,  roll: 10000, failureInt: 9999,  success: true  }
      [0.0002, 0.9997, false ], // { probability: 0.0002,  roll: 9998,  failureInt: 9998,  success: false }
      [0.0002, 0.9998, true  ], // { probability: 0.0002,  roll: 9999,  failureInt: 9998,  success: true  }
      [0.5,    0.4999, false ], // { probability: 0.5,     roll: 5000,  failureInt: 5000,  success: false }
      [0.5,    0.5,    true  ], // { probability: 0.5,     roll: 5001,  failureInt: 5000,  success: true  }
      [0.9998, 0.0001, false ], // { probability: 0.9998,  roll: 2,     failureInt: 2,     success: false }
      [0.9998, 0.0002, true  ], // { probability: 0.9998,  roll: 3,     failureInt: 2,     success: true  }
      [0.9999, 0,      false ], // { probability: 0.9999,  roll: 1,     failureInt: 1,     success: false }
      [0.9999, 0.0001, true  ], // { probability: 0.9999,  roll: 2,     failureInt: 1,     success: true  }
      [1,      0,      true  ], // { probability: 1,       roll: 1,     failureInt: 0,     success: true  }
      [1,      0.0001, true  ], // { probability: 1,       roll: 2,     failureInt: 0,     success: true  }
      [1,      0.9999, true  ], // { probability: 1,       roll: 10000, failureInt: 0,     success: true  }
    ]
    testCases.forEach(([probability, fixedRoll, expectedSuccess]) => {
      rand.set('test_label', fixedRoll)
      const rollResult = rollAgainstProbability(probability, 'test_label')
      expect(rollResult.success).toBe(expectedSuccess)
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
  expect(failureInt).toBe(expectedFailureInt)
  expect(successInt).toBe(expectedSuccessInt)
}
