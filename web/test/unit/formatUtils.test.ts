import { describe, expect, test } from 'vitest'
import { f2div, f2fmtPctDec0, f2fmtPctDec2, toF2 } from '../../src/lib/model/fixed2'
import { fmtPctDec0, fmtPctDec2 } from '../../src/lib/utils/formatUtils'

describe('formatUtils', () => {
  test.each([
    [281, 71, '395%', '395.77%', '395%', '395.00%'],
    [281.9, 71, '397%', '397.04%', '397%', '397.00%'],
  ])(
    'formatting percentages should be accurate (nominator: %f, denominator: %f)',
    (nominator, denominator, expectedFmtPctDec0, expectedFmtPctDec2, expectedF2fmtPctDec0, expectedF2fmtPctDec2) => {
      const ratio = nominator / denominator
      const ratioF2 = f2div(toF2(nominator), toF2(denominator))

      expect(fmtPctDec0(ratio)).toBe(expectedFmtPctDec0)
      expect(fmtPctDec2(ratio)).toBe(expectedFmtPctDec2)
      expect(f2fmtPctDec0(ratioF2)).toBe(expectedF2fmtPctDec0)
      expect(f2fmtPctDec2(ratioF2)).toBe(expectedF2fmtPctDec2)
    },
  )
})
