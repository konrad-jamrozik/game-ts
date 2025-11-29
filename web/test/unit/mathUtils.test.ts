/* eslint-disable vitest/prefer-comparison-matcher */
/* eslint-disable vitest/prefer-equality-matcher */
import { describe, expect, test } from 'vitest'
import { ceil, floor } from '../../src/lib/utils/mathUtils'
import { asF6, f6eq, f6gt, f6lt } from '../../src/lib/model/fixed6'

describe(floor, () => {
  // prettier-ignore
  test.each([
    // basic functionality
    [5.999, 5],
    [5.001, 5],
    [5.000, 5],
    [4.999, 4],
    // negative numbers
    [-5.999, -6],
    [-5.001, -6],
    [-5.000, -5],
    [-4.999, -5],
    // integers
    [5, 5],
    [-5, -5],    
    // zero
    [-0, 0],
    [0, 0],
    [0.0, 0],
    // very small values, but still within acceptable precision
    [0.999_999_9, 0],
    [-0.999_999_9, -1],
    [0.000_000_1, 0],
    [-0.000_000_1, -1],
    // cases with too high precision
    // floor adds 0.000_000_001, so values as close as that to next higher integer 
    // will be rounded up to it instead of down.
    [0.999_999_999, 1], // results in 1 instead of 0 due to too high precision
    [-0.999_999_999, -1], // all good, just rounded down
    [0.000_000_001, 0], // all good, just rounded down
    [-0.000_000_001, 0], // results in 0 instead of -1 due to too high precision
  ])('should floor %f to %f', (value, expected) => {
    expect(floor(value)).toBe(expected)
  })
})

describe(ceil, () => {
  // prettier-ignore
  test.each([
    // basic functionality
    [5.999, 6],
    [5.001, 6],
    [5.000, 5],
    [4.999, 5],
    // negative numbers
    [-5.999, -5],
    [-5.001, -5],
    [-5.000, -5],
    [-4.999, -4],
    // integers
    [5, 5],
    [-5, -5],    
    // zero
    [-0, 0],
    [0, 0],
    [0.0, 0],
    // very small values, but still within acceptable precision
    [0.999_999_9, 1],
    [-0.999_999_9, 0],
    [0.000_000_1, 1],
    [-0.000_000_1, 0],
    // cases with too high precision
    // ceil subtracts 0.000_000_001, so values as close as that to next lower integer 
    // will be rounded down to it instead of up.
    [0.999_999_999, 1], // all good, just rounded up
    [-0.999_999_999, -1], // results in -1 instead of 0 due to too high precision
    [0.000_000_001, 0], // results in 0 instead of 1 due to too high precision
    [-0.000_000_001, 0], // all good, just rounded up
  ])('should ceil %f to %f', (value, expected) => {
    expect(ceil(value)).toBe(expected)
  })
})

/**
 * More of such common pitfalls explained at
 * https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528/c/692b25b2-eb70-8332-b3dd-a1ab8902d25d
 */
describe('Common floating point precision pitfalls', () => {
  test('Floor goes one below after "obviously safe" math', () => {
    const subFromFloat = 1.2 - 1
    expect(subFromFloat).toBe(0.199_999_999_999_999_96)

    const scaled = subFromFloat * 10
    expect(scaled).toBe(1.999_999_999_999_999_6)

    // act
    const mathFloor = Math.floor(scaled)
    const myFloor = floor(scaled)

    expect(mathFloor).toBe(1) // bad, expected 2
    expect(myFloor).toBe(2) // good, as expected
  })

  test('Floor may drop fractional "cents" after conversion to int', () => {
    const price = 0.29
    const cents = price * 100
    expect(cents).toBe(28.999_999_999_999_996)

    // act
    const mathFloor = Math.floor(cents)
    const myFloor = floor(cents)

    expect(mathFloor).toBe(28) // bad, expected 29
    expect(myFloor).toBe(29) // good, as expected
  })

  test('Imprecise division may result in incorrect threshold checks', () => {
    testRatio(0.3, 0.1, 2.999_999_999_999_999_6)
    testRatio(-0.3, 0.1, -2.999_999_999_999_999_6)

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function testRatio(numerator: number, denominator: number, expected: number): void {
      const ratio = numerator / denominator
      expect(ratio).toBe(expected)

      expect(ratio === 3).toBe(false) // bad
      expect(ratio > 3).toBe(false) // good
      expect(ratio < 3).toBe(true) // bad

      const ratioF6 = asF6(ratio)
      const sign = Math.sign(expected)

      expect(f6eq(ratioF6, asF6(3 * sign))).toBe(true) // good
      expect(f6gt(ratioF6, asF6(3 * sign))).toBe(false) // good
      expect(f6lt(ratioF6, asF6(3 * sign))).toBe(false) // good
    }
  })
})
