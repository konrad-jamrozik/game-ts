import { describe, expect, test } from 'vitest'
import { toF6, toF, type Fixed6 } from '../../src/lib/model/fixed6'
import { fmtDec1, fmtPctDec2 } from '../../src/lib/utils/formatUtils'

describe('about_numbers.md', () => {
  test('foobarness doc example', () => {
    // "toF6" means to convert a number to a Fixed6 number
    // As such, storedFoobarness is stored as 13_000_000
    const storedFoobarness: Fixed6 = toF6(13.0)

    // "toF" means to convert a Fixed6 number to a floating point number
    // As such, foobarness is set to 13_000_000 / 1_000_000 = 13.00
    const foobarness: number = toF(storedFoobarness)
    expect(foobarness).toBe(13.0)

    // intermediateFoobarness == 14.560_000_000_000_002
    const intermediateFoobarness: number = foobarness * 1.12
    expect(intermediateFoobarness).toBe(14.560_000_000_000_002)

    // Display intermediateFoobarness as integer with 1 decimal places,
    // after flooring to 1 decimal place.
    // i.e. 14.5
    expect(fmtDec1(intermediateFoobarness)).toBe('14.5')

    // nextFoobarness == 27.227_200_000_000_007
    const nextFoobarness: number = intermediateFoobarness * 1.87
    expect(nextFoobarness).toBe(27.227_200_000_000_007)

    // Display nextFoobarness as percentage with 2 decimal places,
    // i.e. 2722.72%
    expect(fmtPctDec2(nextFoobarness)).toBe('2722.72%')

    // Now storedNextFoobarness is internally stored as integer 27_227_200,
    // effectively rounding it to 27.227200, i.e. to 6 decimal places.
    const storedNextFoobarness: Fixed6 = toF6(nextFoobarness)
    expect(storedNextFoobarness).toStrictEqual(toF6(27.2272))
  })
})
