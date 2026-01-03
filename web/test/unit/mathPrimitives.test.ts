import { describe, expect, test } from 'vitest'
import { ceil, floor, quantileSorted } from '../../src/lib/primitives/mathPrimitives'

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

    // Act
    const mathFloor = Math.floor(scaled)
    const myFloor = floor(scaled)

    expect(mathFloor).toBe(1) // bad, expected 2
    expect(myFloor).toBe(2) // good, as expected
  })

  test('Floor may drop fractional "cents" after conversion to int', () => {
    const price = 0.29
    const cents = price * 100
    expect(cents).toBe(28.999_999_999_999_996)

    // Act
    const mathFloor = Math.floor(cents)
    const myFloor = floor(cents)

    expect(mathFloor).toBe(28) // bad, expected 29
    expect(myFloor).toBe(29) // good, as expected
  })
})

describe(quantileSorted, () => {
  describe('edge cases', () => {
    test('returns 0 for empty array', () => {
      expect(quantileSorted([], 0.5)).toBe(0)
    })

    test('returns the single element for single-element array', () => {
      expect(quantileSorted([42], 0)).toBe(42)
      expect(quantileSorted([42], 0.5)).toBe(42)
      expect(quantileSorted([42], 1)).toBe(42)
    })

    test('clamps q below 0 to 0', () => {
      expect(quantileSorted([10, 20, 30], -0.5)).toBe(10)
    })

    test('clamps q above 1 to 1', () => {
      expect(quantileSorted([10, 20, 30], 1.5)).toBe(30)
    })
  })

  describe('two-element array', () => {
    const arr = [10, 20]

    test('q=0 returns first element', () => {
      expect(quantileSorted(arr, 0)).toBe(10)
    })

    test('q=0.5 returns midpoint (interpolated)', () => {
      expect(quantileSorted(arr, 0.5)).toBe(15)
    })

    test('q=1 returns last element', () => {
      expect(quantileSorted(arr, 1)).toBe(20)
    })

    test('q=0.25 interpolates to 12.5', () => {
      expect(quantileSorted(arr, 0.25)).toBe(12.5)
    })

    test('q=0.75 interpolates to 17.5', () => {
      expect(quantileSorted(arr, 0.75)).toBe(17.5)
    })
  })

  describe('multi-element array with exact positions', () => {
    // Array with 5 elements: indices 0,1,2,3,4
    // For q, position = (length-1) * q = 4 * q
    // q=0 -> pos=0, q=0.25 -> pos=1, q=0.5 -> pos=2, q=0.75 -> pos=3, q=1 -> pos=4
    const arr = [10, 20, 30, 40, 50]

    test('q=0 returns first element', () => {
      expect(quantileSorted(arr, 0)).toBe(10)
    })

    test('q=0.25 returns element at index 1', () => {
      expect(quantileSorted(arr, 0.25)).toBe(20)
    })

    test('q=0.5 (median) returns middle element', () => {
      expect(quantileSorted(arr, 0.5)).toBe(30)
    })

    test('q=0.75 returns element at index 3', () => {
      expect(quantileSorted(arr, 0.75)).toBe(40)
    })

    test('q=1 returns last element', () => {
      expect(quantileSorted(arr, 1)).toBe(50)
    })
  })

  describe('multi-element array with interpolation', () => {
    // Array with 4 elements: indices 0,1,2,3
    // For q, position = (length-1) * q = 3 * q
    // q=0.5 -> pos=1.5, so interpolate between indices 1 and 2
    const arr = [10, 20, 30, 40]

    test('q=0.5 (median) interpolates between indices 1 and 2', () => {
      // pos = 3 * 0.5 = 1.5
      // lower = 1 (value 20), upper = 2 (value 30)
      // weight = 0.5
      // result = 20 + (30-20) * 0.5 = 25
      expect(quantileSorted(arr, 0.5)).toBe(25)
    })

    test('q=0.1 interpolates near the start', () => {
      // pos = 3 * 0.1 = 0.3
      // lower = 0 (value 10), upper = 1 (value 20)
      // weight = 0.3
      // result = 10 + (20-10) * 0.3 = 13
      expect(quantileSorted(arr, 0.1)).toBe(13)
    })

    test('q=0.9 interpolates near the end', () => {
      // pos = 3 * 0.9 = 2.7
      // lower = 2 (value 30), upper = 3 (value 40)
      // weight = 0.7
      // result = 30 + (40-30) * 0.7 = 37
      expect(quantileSorted(arr, 0.9)).toBe(37)
    })
  })

  describe('common percentiles', () => {
    // Array with 10 elements for clearer percentile calculations
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    test('p10 (10th percentile)', () => {
      // pos = 9 * 0.1 = 0.9
      // lower = 0 (value 1), upper = 1 (value 2)
      // weight = 0.9
      // result = 1 + (2-1) * 0.9 = 1.9
      expect(quantileSorted(arr, 0.1)).toBe(1.9)
    })

    test('p50 (median)', () => {
      // pos = 9 * 0.5 = 4.5
      // lower = 4 (value 5), upper = 5 (value 6)
      // weight = 0.5
      // result = 5 + (6-5) * 0.5 = 5.5
      expect(quantileSorted(arr, 0.5)).toBe(5.5)
    })

    test('p90 (90th percentile)', () => {
      // pos = 9 * 0.9 = 8.1
      // lower = 8 (value 9), upper = 9 (value 10)
      // weight = 0.1
      // result = 9 + (10-9) * 0.1 = 9.1
      expect(quantileSorted(arr, 0.9)).toBe(9.1)
    })
  })

  describe('skewed distribution with single outlier', () => {
    // Array with 11 elements: 10 zeros and one 100 at the end
    // This tests behavior when most values are identical with a single outlier
    // pos = (length-1) * q = 10 * q
    const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100]

    test('q=0 returns 0 (first element)', () => {
      // pos = 10 * 0 = 0, lands exactly on index 0
      expect(quantileSorted(arr, 0)).toBe(0)
    })

    test('q=0.1 returns 0 (lands on index 1)', () => {
      // pos = 10 * 0.1 = 1, lands exactly on index 1
      expect(quantileSorted(arr, 0.1)).toBe(0)
    })

    test('q=0.2 returns 0 (lands on index 2)', () => {
      // pos = 10 * 0.2 = 2, lands exactly on index 2
      expect(quantileSorted(arr, 0.2)).toBe(0)
    })
  })
})
