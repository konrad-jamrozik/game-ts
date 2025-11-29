import { describe, expect, test } from 'vitest'
import { ceil, floor } from '../../src/lib/utils/mathUtils'

describe(floor, () => {
  // prettier-ignore
  test.each([
    // basic floor functionality
    [5.999, 5],
    [5.001, 5],
    [5.000, 5],
    [4.999, 4],
    // handles negative numbers
    [-5.999, -6],
    [-5.001, -6],
    [-5.000, -5],
    [-4.999, -5],
    // handles zero
    [-0, 0],
    [0, 0],
    [0.0, 0],
    // handles integers
    [5, 5],
    [-5, -5],
    // handles very small values
    [0.000_000_1, 0],
    [-0.000_000_1, -1],
    // does not handle cases with too high precision
    // floor adds 0.000_000_01, so values as close as that to next higher integer 
    // will be rounded up to it instead of down.
    [0.999_999_99, 1],
    [-0.000_000_01, 0],
  ])('should floor %f to %f', (value, expected) => {
    expect(floor(value)).toBe(expected)
  })
})

describe(ceil, () => {
  // prettier-ignore
  test.each([
    // basic ceil functionality
    [5.999, 6],
    [5.001, 6],
    [5.000, 5],
    // handles negative numbers
    [-5.7, -5],
    [-5.1, -5],
    [-5.0, -5],
    // handles zero
    [0, 0],
    [0.0, 0],
    [-0, 0], // Math.abs prevents -0
    // handles integers
    [5, 5],
    [-5, -5],
    // handles very small values
    [0.000_000_01, 1],
    [0.999_999_99, 1],
    // Values < 0.000_000_01 should return 0 (not -0)
    [0.000_000_000_1, 0],
    // ceil subtracts 0.000_000_01, so values very close to 0 might become negative
    [0.000_000_001, 0],
  ])('should ceil %f to %f', (value, expected) => {
    expect(ceil(value)).toBe(expected)
  })
})

describe('Common floating point precision pitfalls', () => {
  test('extracting fractional part', () => {
    const price = 0.29
    const cents = price * 100
    expect(cents).toBe(28.999_999_999_999_996)

    // act
    const flooredCentsBad = Math.floor(cents)
    const flooredCentsGood = floor(cents)

    expect(flooredCentsBad).toBe(28) // expected 29
    expect(flooredCentsGood).toBe(29)
  })

  test('subtracting floating point numbers', () => {
    const subFromFloat = 1.2 - 1
    expect(subFromFloat).toBe(0.199_999_999_999_999_96)

    const scaled = subFromFloat * 10
    expect(scaled).toBe(1.999_999_999_999_999_6)

    // act
    const flooredBad = Math.floor(scaled)
    const flooredGood = floor(scaled)

    expect(flooredBad).toBe(1) // expected 2
    expect(flooredGood).toBe(2)
  })
})
