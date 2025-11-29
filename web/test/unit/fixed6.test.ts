import { describe, expect, test } from 'vitest'
import { asF6, f6div, f6gt, f6lt, f6multV2, f6sub, asFloat } from '../../src/lib/model/fixed6'
import { floorToDec2 } from '../../src/lib/utils/mathUtils'

describe('Common floating point precision pitfalls', () => {
  test('Imprecise division may result in incorrect threshold checks', () => {
    testRatio(0.3, 0.1, 2.999_999_999_999_999_6)
    testRatio(-0.3, 0.1, -2.999_999_999_999_999_6)

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function testRatio(numerator: number, denominator: number, expected: number): void {
      const ratio = numerator / denominator
      expect(ratio).toBe(expected)

      expect(ratio).not.toBe(3) // bad, expected ratio == 3
      expect(ratio).not.toBeGreaterThan(3) // good, expected ratio to be not > 3
      expect(ratio).toBeLessThan(3) // bad, expected ratio to be not < 3

      const ratioF6 = asF6(ratio)
      const sign = Math.sign(expected)

      expect(ratioF6).toStrictEqual(asF6(3 * sign)) // good
      expect(f6gt(ratioF6, asF6(3 * sign))).toBe(false) // good
      expect(f6lt(ratioF6, asF6(3 * sign))).toBe(false) // good
    }
  })

  test('Minimal: Order of operations causes F6 imprecision affecting F2 precision', () => {
    // Mathematically: 1 - 7/30 = 23/30 = 0.766666...
    // But due to floating point precision and flooring at F6, they differ

    const skill = asF6(150)
    const exhaustionMult = f6div(asF6(85), asF6(100)) // 1 - 15/100 = 85/100 = 0.85

    // Method 1: Compute 1 - 7/30, then multiply
    const hitPointsMult1 = f6sub(asF6(1), f6div(asF6(7), asF6(30)))
    const result1 = f6multV2(skill, hitPointsMult1, exhaustionMult)

    // Method 2: Compute 23/30 directly, then multiply
    const hitPointsMult2 = f6div(asF6(23), asF6(30))
    const result2 = f6multV2(skill, hitPointsMult2, exhaustionMult)

    // Both should mathematically equal 97.75, but F6 precision causes difference
    expect(result1.value).not.toStrictEqual(result2.value)

    // Show the actual F6 values - they differ due to order of operations
    expect(result1.value).toBe(97_750_042) // Method 1: 1 - 7/30
    expect(result2.value).toBe(97_749_915) // Method 2: 23/30

    // When floored to F2 precision (2 decimal places), we expect 97.75
    // But due to F6 imprecision, one method gives 97.74 instead
    const result1Float = asFloat(result1)
    const result2Float = asFloat(result2)
    const result1F2 = floorToDec2(result1Float)
    const result2F2 = floorToDec2(result2Float)

    // Method 1 (1 - 7/30) gives 97.75 at F2 (correct)
    // Method 2 (23/30) gives 97.74 at F2 (incorrect due to F6 imprecision)
    // This demonstrates that order of operations matters!
    expect(result1F2).toStrictEqual(97.75)
    expect(result2F2).toStrictEqual(97.74)

    // The difference shows up at F2 precision even though both should be 97.75
    expect(result1F2).not.toStrictEqual(result2F2)
  })
})
