import { describe, expect, test } from 'vitest'
import {
  ceil,
  computeDecileBands,
  computeQuartileBands,
  computeSkillBands,
  floor,
  quantileSorted,
} from '../../src/lib/primitives/mathPrimitives'

describe(floor, () => {
  // prettier-ignore
  test.each([
    // basic functionality
    [5.999, 5],
    [5.001, 5],
    [5.000, 5],
    [4.999, 4],
    // negative numbers
    [-5.999, -6],
    [-5.001, -6],
    [-5.000, -5],
    [-4.999, -5],
    // integers
    [5, 5],
    [-5, -5],    
    // zero
    [-0, 0],
    [0, 0],
    [0.0, 0],
    // very small values, but still within acceptable precision
    [0.999_999_9, 0],
    [-0.999_999_9, -1],
    [0.000_000_1, 0],
    [-0.000_000_1, -1],
    // cases with too high precision
    // floor adds 0.000_000_001, so values as close as that to next higher integer 
    // will be rounded up to it instead of down.
    [0.999_999_999, 1], // results in 1 instead of 0 due to too high precision
    [-0.999_999_999, -1], // all good, just rounded down
    [0.000_000_001, 0], // all good, just rounded down
    [-0.000_000_001, 0], // results in 0 instead of -1 due to too high precision
  ])('should floor %f to %f', (value, expected) => {
    expect(floor(value)).toBe(expected)
  })
})

describe(ceil, () => {
  // prettier-ignore
  test.each([
    // basic functionality
    [5.999, 6],
    [5.001, 6],
    [5.000, 5],
    [4.999, 5],
    // negative numbers
    [-5.999, -5],
    [-5.001, -5],
    [-5.000, -5],
    [-4.999, -4],
    // integers
    [5, 5],
    [-5, -5],    
    // zero
    [-0, 0],
    [0, 0],
    [0.0, 0],
    // very small values, but still within acceptable precision
    [0.999_999_9, 1],
    [-0.999_999_9, 0],
    [0.000_000_1, 1],
    [-0.000_000_1, 0],
    // cases with too high precision
    // ceil subtracts 0.000_000_001, so values as close as that to next lower integer 
    // will be rounded down to it instead of up.
    [0.999_999_999, 1], // all good, just rounded up
    [-0.999_999_999, -1], // results in -1 instead of 0 due to too high precision
    [0.000_000_001, 0], // results in 0 instead of 1 due to too high precision
    [-0.000_000_001, 0], // all good, just rounded up
  ])('should ceil %f to %f', (value, expected) => {
    expect(ceil(value)).toBe(expected)
  })
})

/**
 * More of such common pitfalls explained at
 * https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528/c/692b25b2-eb70-8332-b3dd-a1ab8902d25d
 */
describe('Common floating point precision pitfalls', () => {
  test('Floor goes one below after "obviously safe" math', () => {
    const subFromFloat = 1.2 - 1
    expect(subFromFloat).toBe(0.199_999_999_999_999_96)

    const scaled = subFromFloat * 10
    expect(scaled).toBe(1.999_999_999_999_999_6)

    // Act
    const mathFloor = Math.floor(scaled)
    const myFloor = floor(scaled)

    expect(mathFloor).toBe(1) // bad, expected 2
    expect(myFloor).toBe(2) // good, as expected
  })

  test('Floor may drop fractional "cents" after conversion to int', () => {
    const price = 0.29
    const cents = price * 100
    expect(cents).toBe(28.999_999_999_999_996)

    // Act
    const mathFloor = Math.floor(cents)
    const myFloor = floor(cents)

    expect(mathFloor).toBe(28) // bad, expected 29
    expect(myFloor).toBe(29) // good, as expected
  })
})

describe(quantileSorted, () => {
  describe('edge cases', () => {
    test('returns 0 for empty array', () => {
      expect(quantileSorted([], 0.5)).toBe(0)
    })

    test('returns the single element for single-element array', () => {
      expect(quantileSorted([42], 0)).toBe(42)
      expect(quantileSorted([42], 0.5)).toBe(42)
      expect(quantileSorted([42], 1)).toBe(42)
    })

    test('clamps q below 0 to 0', () => {
      expect(quantileSorted([10, 20, 30], -0.5)).toBe(10)
    })

    test('clamps q above 1 to 1', () => {
      expect(quantileSorted([10, 20, 30], 1.5)).toBe(30)
    })
  })

  describe('two-element array', () => {
    const arr = [10, 20]

    test('q=0 returns first element', () => {
      expect(quantileSorted(arr, 0)).toBe(10)
    })

    test('q=0.5 returns midpoint (interpolated)', () => {
      expect(quantileSorted(arr, 0.5)).toBe(15)
    })

    test('q=1 returns last element', () => {
      expect(quantileSorted(arr, 1)).toBe(20)
    })

    test('q=0.25 interpolates to 12.5', () => {
      expect(quantileSorted(arr, 0.25)).toBe(12.5)
    })

    test('q=0.75 interpolates to 17.5', () => {
      expect(quantileSorted(arr, 0.75)).toBe(17.5)
    })
  })

  describe('multi-element array with exact positions', () => {
    // Array with 5 elements: indices 0,1,2,3,4
    // For q, position = (length-1) * q = 4 * q
    // q=0 -> pos=0, q=0.25 -> pos=1, q=0.5 -> pos=2, q=0.75 -> pos=3, q=1 -> pos=4
    const arr = [10, 20, 30, 40, 50]

    test('q=0 returns first element', () => {
      expect(quantileSorted(arr, 0)).toBe(10)
    })

    test('q=0.25 returns element at index 1', () => {
      expect(quantileSorted(arr, 0.25)).toBe(20)
    })

    test('q=0.5 (median) returns middle element', () => {
      expect(quantileSorted(arr, 0.5)).toBe(30)
    })

    test('q=0.75 returns element at index 3', () => {
      expect(quantileSorted(arr, 0.75)).toBe(40)
    })

    test('q=1 returns last element', () => {
      expect(quantileSorted(arr, 1)).toBe(50)
    })
  })

  describe('multi-element array with interpolation', () => {
    // Array with 4 elements: indices 0,1,2,3
    // For q, position = (length-1) * q = 3 * q
    // q=0.5 -> pos=1.5, so interpolate between indices 1 and 2
    const arr = [10, 20, 30, 40]

    test('q=0.5 (median) interpolates between indices 1 and 2', () => {
      // pos = 3 * 0.5 = 1.5
      // lower = 1 (value 20), upper = 2 (value 30)
      // weight = 0.5
      // result = 20 + (30-20) * 0.5 = 25
      expect(quantileSorted(arr, 0.5)).toBe(25)
    })

    test('q=0.1 interpolates near the start', () => {
      // pos = 3 * 0.1 = 0.3
      // lower = 0 (value 10), upper = 1 (value 20)
      // weight = 0.3
      // result = 10 + (20-10) * 0.3 = 13
      expect(quantileSorted(arr, 0.1)).toBe(13)
    })

    test('q=0.9 interpolates near the end', () => {
      // pos = 3 * 0.9 = 2.7
      // lower = 2 (value 30), upper = 3 (value 40)
      // weight = 0.7
      // result = 30 + (40-30) * 0.7 = 37
      expect(quantileSorted(arr, 0.9)).toBe(37)
    })
  })

  describe('common percentiles', () => {
    // Array with 10 elements for clearer percentile calculations
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    test('p10 (10th percentile)', () => {
      // pos = 9 * 0.1 = 0.9
      // lower = 0 (value 1), upper = 1 (value 2)
      // weight = 0.9
      // result = 1 + (2-1) * 0.9 = 1.9
      expect(quantileSorted(arr, 0.1)).toBe(1.9)
    })

    test('p50 (median)', () => {
      // pos = 9 * 0.5 = 4.5
      // lower = 4 (value 5), upper = 5 (value 6)
      // weight = 0.5
      // result = 5 + (6-5) * 0.5 = 5.5
      expect(quantileSorted(arr, 0.5)).toBe(5.5)
    })

    test('p90 (90th percentile)', () => {
      // pos = 9 * 0.9 = 8.1
      // lower = 8 (value 9), upper = 9 (value 10)
      // weight = 0.1
      // result = 9 + (10-9) * 0.1 = 9.1
      expect(quantileSorted(arr, 0.9)).toBe(9.1)
    })
  })

  describe('skewed distribution with single outlier', () => {
    // Array with 11 elements: 10 zeros and one 100 at the end
    // This tests behavior when most values are identical with a single outlier
    // pos = (length-1) * q = 10 * q
    const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100]

    test('q=0 returns 0 (first element)', () => {
      // pos = 10 * 0 = 0, lands exactly on index 0
      expect(quantileSorted(arr, 0)).toBe(0)
    })

    test('q=0.1 returns 0 (lands on index 1)', () => {
      // pos = 10 * 0.1 = 1, lands exactly on index 1
      expect(quantileSorted(arr, 0.1)).toBe(0)
    })

    test('q=0.2 returns 0 (lands on index 2)', () => {
      // pos = 10 * 0.2 = 2, lands exactly on index 2
      expect(quantileSorted(arr, 0.2)).toBe(0)
    })
  })
})

describe(computeDecileBands, () => {
  describe('edge cases', () => {
    test('returns empty array for empty input', () => {
      expect(computeDecileBands([])).toStrictEqual([])
    })

    test('single agent creates one band', () => {
      const result = computeDecileBands([100])
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        label: 'Top 10%',
        minSkill: 100,
        maxSkill: 100,
        count: 1,
      })
    })

    test('all agents with same skill create one band', () => {
      const result = computeDecileBands([100, 100, 100, 100, 100])
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        label: 'Top 10%',
        minSkill: 100,
        maxSkill: 100,
        count: 5,
      })
    })
  })

  describe('extreme tie case from spec', () => {
    test('1 agent with skill 600, 20 agents with skill 100', () => {
      // n=21, k=ceil(21*0.1)=3
      // Top band should contain only the skill-600 agent
      // Next bands should all collapse into the same tie group at skill 100
      const skills = [600, ...Array.from({ length: 20 }, () => 100)]
      const result = computeDecileBands(skills)

      // Should have 2 bands: Top 10% with skill 600, and collapsed bands at skill 100
      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result[0]).toStrictEqual({
        label: 'Top 10%',
        minSkill: 600,
        maxSkill: 600,
        count: 1,
      })

      // The remaining agents should be in subsequent bands
      // Since k=3 and we have 20 agents with skill 100, they should be grouped
      const remainingCount = result.slice(1).reduce((sum, band) => sum + band.count, 0)
      expect(remainingCount).toBe(20)
    })
  })

  describe('normal distribution', () => {
    test('10 agents with distinct skills', () => {
      // Skills: 100, 200, 300, ..., 1000
      const skills = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
      const result = computeDecileBands(skills)

      // n=10, k=ceil(10*0.1)=1
      // Each band should contain 1 agent
      expect(result).toHaveLength(10)
      expect(result[0]).toStrictEqual({
        label: 'Top 10%',
        minSkill: 1000,
        maxSkill: 1000,
        count: 1,
      })
      expect(result[9]).toStrictEqual({
        label: '90-100%',
        minSkill: 100,
        maxSkill: 100,
        count: 1,
      })
    })

    test('20 agents with varied skills', () => {
      // Skills: 50, 60, 70, ..., 240 (20 distinct values)
      const skills = Array.from({ length: 20 }, (_, i) => 50 + i * 10)
      const result = computeDecileBands(skills)

      // n=20, k=ceil(20*0.1)=2
      // Should have 10 bands with 2 agents each
      expect(result).toHaveLength(10)
      expect(result[0]).toStrictEqual({
        label: 'Top 10%',
        minSkill: 230,
        maxSkill: 240,
        count: 2,
      })
      expect(result[9]).toStrictEqual({
        label: '90-100%',
        minSkill: 50,
        maxSkill: 60,
        count: 2,
      })
    })
  })

  describe('ties within bands', () => {
    test('ties at band boundary expand the band', () => {
      // n=10, k=1
      // Skills: 100, 90, 90, 80, 70, 60, 50, 40, 30, 20
      // Top band: [100] (1 agent)
      // Next band boundary at index 1 (skill 90), but indices 1-2 both have 90
      // So second band should include both 90s
      const skills = [100, 90, 90, 80, 70, 60, 50, 40, 30, 20]
      const result = computeDecileBands(skills)

      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result[0]).toStrictEqual({
        label: 'Top 10%',
        minSkill: 100,
        maxSkill: 100,
        count: 1,
      })
      // The second band should include both 90s due to tie expansion
      expect(result[1]?.minSkill).toBe(90)
      expect(result[1]?.maxSkill).toBe(90)
      expect(result[1]?.count).toBe(2)
    })

    test('multiple ties causing band absorption', () => {
      // n=30, k=ceil(30*0.1)=3
      // Skills: 1000 (1), 500 (10), 100 (19)
      // Top band: [1000] (1 agent, but k=3, so we'd normally take 3)
      // Since index 0 has 1000 and indices 1-10 have 500, we take just index 0
      // Next: indices 1-3 have 500, but indices 1-10 all have 500, so we take all 10
      // This absorbs multiple theoretical bands
      const skills = [1000, ...Array.from({ length: 10 }, () => 500), ...Array.from({ length: 19 }, () => 100)]
      const result = computeDecileBands(skills)

      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result[0]?.minSkill).toBe(1000)
      expect(result[0]?.maxSkill).toBe(1000)
      expect(result[0]?.count).toBe(1)

      // The 500s should be in one or more bands
      const fiveHundredBands = result.filter((b) => b.minSkill === 500 && b.maxSkill === 500)
      const totalFiveHundred = fiveHundredBands.reduce((sum, b) => sum + b.count, 0)
      expect(totalFiveHundred).toBe(10)
    })
  })

  describe('small samples', () => {
    test('5 agents', () => {
      // n=5, k=ceil(5*0.1)=1
      const skills = [100, 200, 300, 400, 500]
      const result = computeDecileBands(skills)

      // Should have 5 bands with 1 agent each
      expect(result).toHaveLength(5)
      expect(result[0]?.count).toBe(1)
      expect(result[4]?.count).toBe(1)
    })

    test('3 agents', () => {
      // n=3, k=ceil(3*0.1)=1
      const skills = [100, 200, 300]
      const result = computeDecileBands(skills)

      expect(result).toHaveLength(3)
      expect(result[0]?.minSkill).toBe(300)
      expect(result[2]?.minSkill).toBe(100)
    })
  })
})

describe(computeQuartileBands, () => {
  describe('edge cases', () => {
    test('returns empty array for empty input', () => {
      expect(computeQuartileBands([])).toStrictEqual([])
    })

    test('single agent creates one band', () => {
      const result = computeQuartileBands([100])
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        label: 'Top 25%',
        minSkill: 100,
        maxSkill: 100,
        count: 1,
      })
    })

    test('all agents with same skill create one band', () => {
      const result = computeQuartileBands([100, 100, 100, 100, 100])
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        label: 'Top 25%',
        minSkill: 100,
        maxSkill: 100,
        count: 5,
      })
    })
  })

  describe('extreme tie case', () => {
    test('1 agent with skill 600, 20 agents with skill 100', () => {
      // n=21, k=ceil(21*0.25)=6
      // Top band should contain only the skill-600 agent
      // Next bands should all collapse into the same tie group at skill 100
      const skills = [600, ...Array.from({ length: 20 }, () => 100)]
      const result = computeQuartileBands(skills)

      // Should have at least 1 band: Top 25% with skill 600
      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result[0]).toStrictEqual({
        label: 'Top 25%',
        minSkill: 600,
        maxSkill: 600,
        count: 1,
      })

      // The remaining agents should be in subsequent bands
      const remainingCount = result.slice(1).reduce((sum, band) => sum + band.count, 0)
      expect(remainingCount).toBe(20)
    })
  })

  describe('normal distribution', () => {
    test('4 agents with distinct skills', () => {
      // Skills: 100, 200, 300, 400
      const skills = [100, 200, 300, 400]
      const result = computeQuartileBands(skills)

      // n=4, k=ceil(4*0.25)=1
      // Each band should contain 1 agent
      expect(result).toHaveLength(4)
      expect(result[0]).toStrictEqual({
        label: 'Top 25%',
        minSkill: 400,
        maxSkill: 400,
        count: 1,
      })
      expect(result[3]).toStrictEqual({
        label: '75-100%',
        minSkill: 100,
        maxSkill: 100,
        count: 1,
      })
    })

    test('8 agents with varied skills', () => {
      // Skills: 50, 60, 70, 80, 90, 100, 110, 120 (8 distinct values)
      const skills = Array.from({ length: 8 }, (_, i) => 50 + i * 10)
      const result = computeQuartileBands(skills)

      // n=8, k=ceil(8*0.25)=2
      // Should have 4 bands with 2 agents each
      expect(result).toHaveLength(4)
      expect(result[0]).toStrictEqual({
        label: 'Top 25%',
        minSkill: 110,
        maxSkill: 120,
        count: 2,
      })
      expect(result[3]).toStrictEqual({
        label: '75-100%',
        minSkill: 50,
        maxSkill: 60,
        count: 2,
      })
    })
  })

  describe('ties within bands', () => {
    test('ties at band boundary expand the band', () => {
      // n=8, k=ceil(8*0.25)=2
      // Skills sorted desc: [100, 90, 90, 80, 70, 60, 50, 40]
      // Top band: takes 2 agents (100, 90 at index 1). Since 100 < 90*2=180, it's not
      // significantly higher, so we don't isolate it - we take the normal k=2 agents.
      // Second band: takes 2 agents (90 at index 2, 80). The 90 at index 2 is the remaining one.
      const skills = [100, 90, 90, 80, 70, 60, 50, 40]
      const result = computeQuartileBands(skills)

      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result[0]).toStrictEqual({
        label: 'Top 25%',
        minSkill: 90,
        maxSkill: 100,
        count: 2,
      })
      // The second band takes the other 90 plus 80 (k=2 agents)
      expect(result[1]?.minSkill).toBe(80)
      expect(result[1]?.maxSkill).toBe(90)
      expect(result[1]?.count).toBe(2)
    })
  })

  describe('small samples', () => {
    test('3 agents', () => {
      // n=3, k=ceil(3*0.25)=1
      const skills = [100, 200, 300]
      const result = computeQuartileBands(skills)

      expect(result).toHaveLength(3)
      expect(result[0]?.minSkill).toBe(300)
      expect(result[2]?.minSkill).toBe(100)
    })

    test('2 agents', () => {
      // n=2, k=ceil(2*0.25)=1
      const skills = [100, 200]
      const result = computeQuartileBands(skills)

      expect(result).toHaveLength(2)
      expect(result[0]?.minSkill).toBe(200)
      expect(result[1]?.minSkill).toBe(100)
    })
  })
})

describe(computeSkillBands, () => {
  describe('edge cases', () => {
    test('returns empty array for empty input', () => {
      expect(computeSkillBands([])).toStrictEqual([])
    })

    test('single agent creates one green band', () => {
      const result = computeSkillBands([100])
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 100,
        maxSkill: 100,
        count: 1,
      })
    })

    test('all agents with same skill create one green band', () => {
      const result = computeSkillBands([100, 100, 100, 100, 100])
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 100,
        maxSkill: 100,
        count: 5,
      })
    })
  })

  describe('acceptance test 1: two-cluster case', () => {
    test('1 1 1 1 1 4 4 4 4 4: Green = all 1s, Dark Red = all 4s, Yellow/Orange/Red empty', () => {
      // This is the key acceptance test - the two-cluster case should put
      // all 1s in Green (bottom 25%) and all 4s in Dark Red (top 5%)
      // n=10, i25=2, i50=4, i75=7, i95=9
      // p25=1, p50=1, p75=4, p95=4
      // Green: skill <= 1 → all 1s (5)
      // Yellow: 1 < skill <= 1 → none
      // Orange: 1 < skill < 4 → none
      // Red: 4 <= skill < 4 → none (p75 = p95 = 4)
      // Dark Red: skill >= 4 → all 4s (5)
      const skills = [1, 1, 1, 1, 1, 4, 4, 4, 4, 4]
      const result = computeSkillBands(skills)

      expect(result).toHaveLength(2)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 1,
        maxSkill: 1,
        count: 5,
      })
      expect(result[1]).toStrictEqual({
        band: 'darkRed',
        minSkill: 4,
        maxSkill: 4,
        count: 5,
      })
    })
  })

  describe('acceptance test 2: four distinct values', () => {
    test('100 100 200 200 200 300 300 400 400 400: distributed across bands', () => {
      // n=10, i25=2, i50=4, i75=7, i95=9
      // Sorted: [100, 100, 200, 200, 200, 300, 300, 400, 400, 400]
      // p25=sSorted[2]=200, p50=sSorted[4]=200, p75=sSorted[7]=400, p95=sSorted[9]=400
      // Green: skill <= 200 → 100, 100, 200, 200, 200 (5)
      // Yellow: 200 < skill <= 200 → none
      // Orange: 200 < skill < 400 → 300, 300 (2)
      // Red: 400 <= skill < 400 → none (p75 = p95 = 400)
      // Dark Red: skill >= 400 → 400, 400, 400 (3)
      const skills = [100, 100, 200, 200, 200, 300, 300, 400, 400, 400]
      const result = computeSkillBands(skills)

      expect(result).toHaveLength(3)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 100,
        maxSkill: 200,
        count: 5,
      })
      expect(result[1]).toStrictEqual({
        band: 'orange',
        minSkill: 300,
        maxSkill: 300,
        count: 2,
      })
      expect(result[2]).toStrictEqual({
        band: 'darkRed',
        minSkill: 400,
        maxSkill: 400,
        count: 3,
      })
    })
  })

  describe('acceptance test 3: stability - bottom changes should not affect top', () => {
    test('raising low-end skills does not reduce Dark Red band when p95 unchanged', () => {
      // Original: [1, 1, 1, 1, 5, 5, 5, 10, 10, 10]
      // n=10, p75=sSorted[7]=10, p95=sSorted[9]=10
      // Dark Red: skill >= 10 → 10, 10, 10 (3)
      const original = [1, 1, 1, 1, 5, 5, 5, 10, 10, 10]
      const originalResult = computeSkillBands(original)
      const originalDarkRedBand = originalResult.find((b) => b.band === 'darkRed')

      // Modified: raise low-end skills from 1 to 3
      // [3, 3, 3, 3, 5, 5, 5, 10, 10, 10]
      // p95 is still sSorted[9]=10
      // Dark Red should still be: skill >= 10 → 10, 10, 10 (3)
      const modified = [3, 3, 3, 3, 5, 5, 5, 10, 10, 10]
      const modifiedResult = computeSkillBands(modified)
      const modifiedDarkRedBand = modifiedResult.find((b) => b.band === 'darkRed')

      expect(originalDarkRedBand?.count).toBe(3)
      expect(modifiedDarkRedBand?.count).toBe(3)
      expect(originalDarkRedBand).toStrictEqual(modifiedDarkRedBand)
    })
  })

  describe('normal distribution', () => {
    test('4 agents with distinct skills: one per band', () => {
      // n=4, i25=0, i50=1, i75=2, i95=3
      // Sorted: [100, 200, 300, 400]
      // p25=100, p50=200, p75=300, p95=400
      // Green: skill <= 100 → 100 (1)
      // Yellow: 100 < skill <= 200 → 200 (1)
      // Orange: 200 < skill < 300 → none
      // Red: 300 <= skill < 400 → 300 (1)
      // Dark Red: skill >= 400 → 400 (1)
      const skills = [100, 200, 300, 400]
      const result = computeSkillBands(skills)

      expect(result).toHaveLength(4)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.minSkill).toBe(100)
      expect(result[0]?.count).toBe(1)
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.minSkill).toBe(200)
      expect(result[1]?.count).toBe(1)
      expect(result[2]?.band).toBe('red')
      expect(result[2]?.minSkill).toBe(300)
      expect(result[2]?.count).toBe(1)
      expect(result[3]?.band).toBe('darkRed')
      expect(result[3]?.minSkill).toBe(400)
      expect(result[3]?.count).toBe(1)
    })

    test('8 agents with distinct skills: proper quartile distribution', () => {
      // n=8, i25=1, i50=3, i75=5, i95=7
      // Sorted: [10, 20, 30, 40, 50, 60, 70, 80]
      // p25=20, p50=40, p75=60, p95=80
      // Green: skill <= 20 → 10, 20 (2)
      // Yellow: 20 < skill <= 40 → 30, 40 (2)
      // Orange: 40 < skill < 60 → 50 (1)
      // Red: 60 <= skill < 80 → 60, 70 (2)
      // Dark Red: skill >= 80 → 80 (1)
      const skills = [10, 20, 30, 40, 50, 60, 70, 80]
      const result = computeSkillBands(skills)

      expect(result).toHaveLength(5)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.count).toBe(2)
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.count).toBe(2)
      expect(result[2]?.band).toBe('orange')
      expect(result[2]?.count).toBe(1)
      expect(result[3]?.band).toBe('red')
      expect(result[3]?.count).toBe(2)
      expect(result[4]?.band).toBe('darkRed')
      expect(result[4]?.count).toBe(1)
    })

    test('20 agents: top 5% band correctly identifies highest skills', () => {
      // n=20, i25=4, i50=9, i75=14, i95=18
      // Sorted: [10, 20, 30, ..., 200]
      // p25=50, p50=100, p75=150, p95=190
      // Dark Red: skill >= 190 → 190, 200 (2 agents, top 10% but algorithm uses p95)
      const skills = Array.from({ length: 20 }, (_, i) => 10 + i * 10)
      const result = computeSkillBands(skills)

      const darkRedBand = result.find((b) => b.band === 'darkRed')
      expect(darkRedBand).toBeDefined()
      expect(darkRedBand?.minSkill).toBe(190)
      expect(darkRedBand?.maxSkill).toBe(200)
      expect(darkRedBand?.count).toBeGreaterThanOrEqual(1)
    })
  })

  describe('percentile index calculation', () => {
    test('n=1: all percentiles point to index 0', () => {
      // i25 = ceil(0.25) - 1 = 1 - 1 = 0
      // i50 = ceil(0.50) - 1 = 1 - 1 = 0
      // i75 = ceil(0.75) - 1 = 1 - 1 = 0
      // i95 = ceil(0.95) - 1 = 1 - 1 = 0
      // All thresholds = 50, so everything goes to Green
      const result = computeSkillBands([50])
      expect(result).toHaveLength(1)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.count).toBe(1)
    })

    test('n=2: handles small array correctly', () => {
      // i25 = ceil(0.5) - 1 = 1 - 1 = 0
      // i50 = ceil(1.0) - 1 = 1 - 1 = 0
      // i75 = ceil(1.5) - 1 = 2 - 1 = 1
      // i95 = ceil(1.9) - 1 = 2 - 1 = 1
      // Sorted: [10, 20]
      // p25=10, p50=10, p75=20, p95=20
      // Green: skill <= 10 → 10 (1)
      // Dark Red: skill >= 20 → 20 (1)
      const result = computeSkillBands([10, 20])
      expect(result).toHaveLength(2)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.minSkill).toBe(10)
      expect(result[0]?.count).toBe(1)
      expect(result[1]?.band).toBe('darkRed')
      expect(result[1]?.minSkill).toBe(20)
      expect(result[1]?.count).toBe(1)
    })

    test('n=3: handles small array correctly', () => {
      // i25 = ceil(0.75) - 1 = 1 - 1 = 0
      // i50 = ceil(1.5) - 1 = 2 - 1 = 1
      // i75 = ceil(2.25) - 1 = 3 - 1 = 2
      // i95 = ceil(2.85) - 1 = 3 - 1 = 2
      // Sorted: [10, 20, 30]
      // p25=10, p50=20, p75=30, p95=30
      // Green: skill <= 10 → 10 (1)
      // Yellow: 10 < skill <= 20 → 20 (1)
      // Dark Red: skill >= 30 → 30 (1)
      const result = computeSkillBands([10, 20, 30])
      expect(result).toHaveLength(3)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.count).toBe(1)
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.count).toBe(1)
      expect(result[2]?.band).toBe('darkRed')
      expect(result[2]?.count).toBe(1)
    })
  })

  describe('ties at percentile boundaries', () => {
    test('ties spanning multiple bands are handled correctly', () => {
      // Skills: 100 agents at skill 50
      // All percentiles point to 50, everything goes to Green
      const skills = Array.from({ length: 100 }, () => 50)
      const result = computeSkillBands(skills)

      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 50,
        maxSkill: 50,
        count: 100,
      })
    })

    test('three distinct values with ties', () => {
      // [1, 1, 1, 2, 2, 2, 3, 3, 3, 3] (n=10)
      // i25=2, i50=4, i75=7, i95=9
      // Sorted: [1, 1, 1, 2, 2, 2, 3, 3, 3, 3]
      // p25=1, p50=2, p75=3, p95=3
      // Green: skill <= 1 → 1, 1, 1 (3)
      // Yellow: 1 < skill <= 2 → 2, 2, 2 (3)
      // Red: 3 <= skill < 3 → none (p75 = p95 = 3)
      // Dark Red: skill >= 3 → 3, 3, 3, 3 (4)
      const skills = [1, 1, 1, 2, 2, 2, 3, 3, 3, 3]
      const result = computeSkillBands(skills)

      expect(result).toHaveLength(3)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.count).toBe(3)
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.count).toBe(3)
      expect(result[2]?.band).toBe('darkRed')
      expect(result[2]?.count).toBe(4)
    })
  })
})
