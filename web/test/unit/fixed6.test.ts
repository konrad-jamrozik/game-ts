import { describe, expect, test } from 'vitest'
import { asF6, f6div, f6fmtPctDec2, f6gt, f6lt, f6multV2, f6multV3 } from '../../src/lib/model/fixed6'
import { round6 } from '../../src/lib/utils/mathUtils'

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

  test('F6 does not protect against div imprecision for F2', () => {
    // 23/10 * 85/2 = 1955 / 20 = 97.75

    const div1 = 23 / 10
    const div2 = 85 / 2
    const div3 = div1 * div2
    expect(div3).toBe(97.749_999_999_999_99)

    expect(round6(div3)).toBe(97.75)

    const f6div1 = f6div(asF6(23), asF6(10))
    const f6div2 = f6div(asF6(85), asF6(2))
    const f6div3 = f6multV2(f6div1, f6div2)
    expect(f6div3).toStrictEqual(asF6(97.749_999_999_999_99))

    expect(f6fmtPctDec2(f6div3)).toBe('9774.99%')

    const f6div3r = f6multV3(f6div1, f6div2)
    expect(f6div3r).toStrictEqual(asF6(97.75))

    expect(f6fmtPctDec2(f6div3r)).toBe('9775.00%')
  })
})
