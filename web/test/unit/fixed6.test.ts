import { describe, expect, test } from 'vitest'
import {
  fixed6,
  fmtDiffStr,
  f6fmtPctDec2,
  f6gt,
  f6lt,
  floorToF6,
  roundToF6,
  f6mult,
  toF6,
} from '../../src/lib/primitives/fixed6'

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

      const ratioF6 = toF6(ratio)
      const sign = Math.sign(expected)

      expect(ratioF6).toStrictEqual(toF6(3 * sign)) // good
      expect(f6gt(ratioF6, toF6(3 * sign))).toBe(false) // good
      expect(f6lt(ratioF6, toF6(3 * sign))).toBe(false) // good
    }
  })

  test('Rounding allows F2 to work well with F6, while flooring does not', () => {
    const resultFloat = (23 / 10) * (85 / 2)
    // 23/10 * 85/2 = 1955 / 20 = 97.75
    // but the internal float is:
    // 97.74999999999999

    // This section proves floor behaves badly:
    // Starting float:   97.74999999999999
    // First we floor to 97.749_999
    // Then again to     97.74
    const resultF6floor = floorToF6(resultFloat)
    expect(resultF6floor).toStrictEqual(toF6(97.749_999))
    expect(f6fmtPctDec2(resultF6floor)).toBe('9774.99%')

    // This section proves rounding behaves well:
    // First we round to 97.750_000
    // Then again to     97.75
    const resultF6round = roundToF6(resultFloat)
    expect(resultF6round).toStrictEqual(toF6(97.75))
    expect(f6fmtPctDec2(resultF6round)).toBe('9775.00%')
  })

  test('f6mult returns float number', () => {
    const res1 = f6mult(toF6(1234), 0.5)
    expect(res1).toBe(617)
    const res2 = f6mult(toF6(1234), 0.12)
    expect(res2).toBeCloseTo(148.08, 10)
    const res3 = f6mult(toF6(1234), 0.000_000_05)
    expect(res3).toBeCloseTo(0.000_061_7, 10)
  })
})

describe(fmtDiffStr, () => {
  test('Diff from 0.11% to 0.10% displays as -0.01%', () => {
    // Current:   fixed6(1160), displayed as 0.11%
    // Projected: fixed6(1020), displayed as 0.10%
    // Diff:      fixed6(-140), should be displayed as -0.01%
    const current = fixed6(1160)
    const projected = fixed6(1020)
    const diff = fixed6(projected.value - current.value)

    expect(f6fmtPctDec2(current)).toBe('0.11%')
    expect(f6fmtPctDec2(projected)).toBe('0.10%')
    expect(fmtDiffStr(diff)).toBe('-0.01%')
  })

  test('Diff from 0.11% to 0.09% displays as -0.02%', () => {
    // Current:   fixed6(1120), displayed as 0.11%
    // Projected: fixed6(980), displayed as 0.09%
    // Diff:      fixed6(-140), should be displayed as -0.02%
    const current = fixed6(1120)
    const projected = fixed6(980)
    const diff = fixed6(projected.value - current.value)

    expect(f6fmtPctDec2(current)).toBe('0.11%')
    expect(f6fmtPctDec2(projected)).toBe('0.09%')
    expect(fmtDiffStr(diff)).toBe('-0.02%')
  })
})
