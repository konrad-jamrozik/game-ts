import { describe, expect, test } from 'vitest'
import { f2div, f2fmtPctDec0, f2fmtPctDec2, toF2 } from '../../src/lib/model/fixed2'
import { fmtPctDec0, fmtPctDec2 } from '../../src/lib/utils/formatUtils'

describe('fixed2 formatting tests - fixed2', () => {
  test('formatting percentages should be accurate', () => {
    const nominator = 281
    const denominator = 71

    const ratio = nominator / denominator
    const ratioF2 = f2div(toF2(nominator), toF2(denominator))

    expect(fmtPctDec0(ratio)).toBe('395%')
    expect(fmtPctDec2(ratio)).toBe('395.77%')
    expect(f2fmtPctDec0(ratioF2)).toBe('395%')
    expect(f2fmtPctDec2(ratioF2)).toBe('395.00%')
  })
})
