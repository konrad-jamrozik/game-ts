import { describe, expect, test } from 'vitest'
import { asF6, f6div, f6gt, f6lt, f6multV2, f6sub } from '../../src/lib/model/fixed6'
import { div } from '../../src/lib/utils/mathUtils'

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

  test('Imprecision at F6 causing issues for F4 - F6 arithmetic', () => {
    const skill = asF6(150)
    const hitPointsMalus = f6div(asF6(7), asF6(30))
    const exhaustionMalus = f6div(asF6(15), asF6(100))
    const hitPointsMult = f6sub(asF6(1), hitPointsMalus)
    const exhaustionMult = f6sub(asF6(1), exhaustionMalus)
    const effectiveSkill = f6multV2(skill, hitPointsMult, exhaustionMult)
    // effective_skill = 150 * (1 - 7/30) * (1 - 15/100) = 150 * 0.76666... * 0.85 = 97.75
    // effective_skill = 150 * (1 - 7/30) * (1 - 15/100) = 150 * 23/30 * 85/100 =
    //                 = 1*23*85/ (2*10)  = 1955 / 20 = 97.75
    // So we want 97.750_000 but it actually is 97.750_042
    expect(effectiveSkill).toStrictEqual(asF6(97.750_042))
  })

  test('Imprecision at F6 causing issues for F4 - F6 arithmetic 2', () => {
    const skill = asF6(150)
    const hitPointsMult = f6div(asF6(23), asF6(30))
    const exhaustionMult = f6div(asF6(85), asF6(100))
    const effectiveSkill = f6multV2(skill, hitPointsMult, exhaustionMult)
    // effective_skill = 150 * (1 - 7/30) * (1 - 15/100) = 150 * 0.76666... * 0.85 = 97.75
    // effective_skill = 150 * (1 - 7/30) * (1 - 15/100) = 150 * 23/30 * 85/100 =
    //                 = 1*23*85/ (2*10)  = 1955 / 20 = 97.75
    // So we want 97.750_000 but it actually is 97.749_915
    expect(effectiveSkill).toStrictEqual(asF6(97.749_915))
  })

  test('Imprecision at F6 causing issues for F4 - float arithmetic', () => {
    const skill = asF6(150)
    const hitPointsMalus = div(7, 30)
    const exhaustionMalus = div(15, 100)
    const hitPointsMult = 1 - hitPointsMalus
    const exhaustionMult = 1 - exhaustionMalus
    expect(hitPointsMult).toStrictEqual(0.766_666_666_666_666_6)
    expect(exhaustionMult).toStrictEqual(0.85)

    const effectiveSkill = f6multV2(skill, hitPointsMult, exhaustionMult)
    // effective_skill = 150 * (1 - 7/30) * (1 - 15/100) = 150 * 0.76666... * 0.85 = 97.75
    // equivalently:
    // effective_skill = 150 * (1 - 7/30) * (1 - 15/100) = 150 * 23/30 * 85/100 =
    //                 = 1*23*85/ (2*10)  = 1955 / 20 = 97.75

    // So we want 97.750_000 but it actually is 97.749_915
    expect(effectiveSkill).toStrictEqual(asF6(97.749_915))
  })
})
