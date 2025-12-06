import { describe, expect, test } from 'vitest'
import {
  fixed6,
  f4fmtDiffStr,
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

describe(f4fmtDiffStr, () => {
  // prettier-ignore
  test.each<[string, number, number, string, string, string]>([
    // Displayed value change of 200, but diff almost 300
    // Ceil or round on diff would incorrectly make it 300
    // Diff must be floored.
    ['Diff from 0.25% to 0.27% displays as  0.02% (diff:  298)', 2501, 2799, '0.25%', '0.27%',  '0.02%'],
    // Displayed value change of 200, but diff barely above 100.
    // Floor or round on diff would incorrectly make it 100.
    // Diff must be ceiled.
    ['Diff from 0.25% to 0.27% displays as  0.02% (diff:  102)', 2599, 2701, '0.25%', '0.27%',  '0.02%'],
    
    ['Diff from 0.25% to 0.26% displays as  0.01% (diff:  198)', 2501, 2699, '0.25%', '0.26%',  '0.01%'],
    ['Diff from 0.25% to 0.26% displays as  0.01% (diff:  100)', 2500, 2600, '0.25%', '0.26%',  '0.01%'],
    ['Diff from 0.25% to 0.26% displays as  0.01% (diff:    2)', 2599, 2601, '0.25%', '0.26%',  '0.01%'],
    
    ['Diff from 0.25% to 0.25% displays as  0.00% (diff:   98)', 2501, 2599, '0.25%', '0.25%',  '0.00%'],
    ['Diff from 0.25% to 0.25% displays as  0.00% (diff:    0)', 2550, 2550, '0.25%', '0.25%',  '0.00%'],
    ['Diff from 0.25% to 0.25% displays as -0.00% (diff:  -98)', 2599, 2501, '0.25%', '0.25%', '-0.00%'],
    
    ['Diff from 0.25% to 0.24% displays as -0.01% (diff:   -2)', 2501, 2499, '0.25%', '0.24%', '-0.01%'],
    ['Diff from 0.25% to 0.24% displays as -0.01% (diff: -100)', 2500, 2400, '0.25%', '0.24%', '-0.01%'],
    ['Diff from 0.25% to 0.24% displays as -0.01% (diff: -198)', 2599, 2401, '0.25%', '0.24%', '-0.01%'],
    
    ['Diff from 0.25% to 0.23% displays as -0.02% (diff: -102)', 2501, 2399, '0.25%', '0.23%', '-0.02%'],
    ['Diff from 0.25% to 0.23% displays as -0.02% (diff: -298)', 2599, 2301, '0.25%', '0.23%', '-0.02%'],
    ['Diff from 30.00% to 30.01% displays as 1% (diff: 40)', 300_080, 300_120, '30.00%', '30.01%', '0.01%'],
    ['Diff from 30.00% to 30.00% displays as 0% (diff: 40)', 300_020, 300_060, '30.00%', '30.00%', '0.00%'],
  ])('%s', (_testName, current, projected, currentDisplay, projectedDisplay, expectedDiff) => {
    const currentF6 = fixed6(current)
    const projectedF6 = fixed6(projected)

    expect(f6fmtPctDec2(currentF6)).toBe(currentDisplay)
    expect(f6fmtPctDec2(projectedF6)).toBe(projectedDisplay)
    expect(f4fmtDiffStr(currentF6, projectedF6)).toBe(expectedDiff)
  })
})
