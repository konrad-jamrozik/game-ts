import { describe, expect, test } from 'vitest'
import { toF6, f6div, f6fmtPctDec0, f6fmtPctDec2 } from '../../src/lib/model/fixed6'
import { fmtPctDec0, fmtPctDec2 } from '../../src/lib/utils/formatUtils'

describe('formatUtils', () => {
  test.each([
    [281, 71, '395%', '395.77%', '395%', '395.77%'],
    [281.9, 71, '397%', '397.04%', '397%', '397.04%'],
  ])(
    'formatting percentages should be accurate (nominator: %f, denominator: %f)',
    (nominator, denominator, expectedFmtPctDec0, expectedFmtPctDec2, expectedF6fmtPctDec0, expectedF6fmtPctDec2) => {
      const ratio = nominator / denominator
      const ratioF6 = f6div(toF6(nominator), toF6(denominator))

      expect(fmtPctDec0(ratio)).toBe(expectedFmtPctDec0)
      expect(fmtPctDec2(ratio)).toBe(expectedFmtPctDec2)
      expect(f6fmtPctDec0(ratioF6)).toBe(expectedF6fmtPctDec0)
      expect(f6fmtPctDec2(ratioF6)).toBe(expectedF6fmtPctDec2)
    },
  )
})
