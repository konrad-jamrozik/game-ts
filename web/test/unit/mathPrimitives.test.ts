import { describe, expect, test } from 'vitest'
import {
  ceil,
  computeDecileBands,
  computeDistinctSkillBands,
  computeQuartileBands,
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
      // n=8, k=2
      // Skills: 100, 90, 90, 80, 70, 60, 50, 40
      // Top band: [100] (1 agent, but k=2, so we'd normally take 2)
      // Since 100 is unique and >= 90*2, we take only [100]
      // Next band boundary at index 1 (skill 90), but indices 1-2 both have 90
      // So second band should include both 90s
      const skills = [100, 90, 90, 80, 70, 60, 50, 40]
      const result = computeQuartileBands(skills)

      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result[0]).toStrictEqual({
        label: 'Top 25%',
        minSkill: 100,
        maxSkill: 100,
        count: 1,
      })
      // The second band should include both 90s due to tie expansion
      expect(result[1]?.minSkill).toBe(90)
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

describe(computeDistinctSkillBands, () => {
  const baselineSkill = 100

  describe('edge cases', () => {
    test('returns empty array for empty input', () => {
      expect(computeDistinctSkillBands([], baselineSkill)).toStrictEqual([])
    })

    test('returns empty array when all skills are below baseline', () => {
      expect(computeDistinctSkillBands([99, 50], baselineSkill)).toStrictEqual([])
    })

    test('agents at baseline create one green band', () => {
      const result = computeDistinctSkillBands([100, 100, 100], baselineSkill)
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 100,
        maxSkill: 100,
        skillRangeMin: 100,
        skillRangeMax: 100,
        count: 3,
      })
    })

    test('single skill above baseline creates one green band', () => {
      const result = computeDistinctSkillBands([110], baselineSkill)
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 110,
        maxSkill: 110,
        skillRangeMin: 100,
        skillRangeMax: 110,
        count: 1,
      })
    })

    test('multiple agents with same skill above baseline create one green band', () => {
      const result = computeDistinctSkillBands([110, 110, 110], baselineSkill)
      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 110,
        maxSkill: 110,
        skillRangeMin: 100,
        skillRangeMax: 110,
        count: 3,
      })
    })
  })

  describe('two distinct skill values', () => {
    test('creates green and yellow bands', () => {
      const result = computeDistinctSkillBands([110, 125], baselineSkill)
      expect(result).toHaveLength(2)
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 110,
        maxSkill: 110,
        skillRangeMin: 100,
        skillRangeMax: 124,
        count: 1,
      })
      expect(result[1]).toStrictEqual({
        band: 'yellow',
        minSkill: 125,
        maxSkill: 125,
        skillRangeMin: 125,
        skillRangeMax: 125,
        count: 1,
      })
    })

    test('handles multiple agents per distinct value', () => {
      const result = computeDistinctSkillBands([110, 110, 125, 125, 125], baselineSkill)
      expect(result).toHaveLength(2)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.count).toBe(2)
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.count).toBe(3)
    })
  })

  describe('three distinct skill values', () => {
    test('creates green, yellow, and orange bands', () => {
      const result = computeDistinctSkillBands([110, 125, 150], baselineSkill)
      expect(result).toHaveLength(3)
      expect(result[0]?.band).toBe('green')
      expect(result[1]?.band).toBe('yellow')
      expect(result[2]?.band).toBe('orange')
    })
  })

  describe('four or more distinct skill values - spec example', () => {
    test('example from spec: 10 distinct values', () => {
      // Distinct skill values: 110, 125, 150, 175, 200, 210, 230, 250, 270, 290
      // 10 / 4 = 2, remainder 2
      // green: 3 values (110, 125, 150) → [101, 174]
      // yellow: 3 values (175, 200, 210) → [175, 229]
      // orange: 2 values (230, 250) → [230, 269]
      // red: 2 values (270, 290) → [270, 290]
      const skills = [110, 125, 150, 175, 200, 210, 230, 250, 270, 290]
      const result = computeDistinctSkillBands(skills, baselineSkill)

      expect(result).toHaveLength(4)

      // Green band: 3 distinct values
      expect(result[0]).toStrictEqual({
        band: 'green',
        minSkill: 110,
        maxSkill: 150,
        skillRangeMin: 100,
        skillRangeMax: 174,
        count: 3,
      })

      // Yellow band: 3 distinct values
      expect(result[1]).toStrictEqual({
        band: 'yellow',
        minSkill: 175,
        maxSkill: 210,
        skillRangeMin: 175,
        skillRangeMax: 229,
        count: 3,
      })

      // Orange band: 2 distinct values
      expect(result[2]).toStrictEqual({
        band: 'orange',
        minSkill: 230,
        maxSkill: 250,
        skillRangeMin: 230,
        skillRangeMax: 269,
        count: 2,
      })

      // Red band: 2 distinct values
      expect(result[3]).toStrictEqual({
        band: 'red',
        minSkill: 270,
        maxSkill: 290,
        skillRangeMin: 270,
        skillRangeMax: 290,
        count: 2,
      })
    })

    test('example from spec: 110 and 125 both go to green', () => {
      // If there are agents with skills: 110, 125, 150, 175, 200
      // 5 distinct values: 5 / 4 = 1, remainder 1
      // green gets 2 values (110, 125), yellow/orange/red get 1 each
      const skills = [110, 125, 150, 175, 200]
      const result = computeDistinctSkillBands(skills, baselineSkill)

      expect(result).toHaveLength(4)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.minSkill).toBe(110)
      expect(result[0]?.maxSkill).toBe(125) // 2 distinct values: 110, 125
      expect(result[0]?.count).toBe(2) // 110, 125
    })

    test('exactly 4 distinct values', () => {
      // 4 / 4 = 1, no remainder
      // Each band gets 1 distinct value
      const skills = [110, 125, 150, 175]
      const result = computeDistinctSkillBands(skills, baselineSkill)

      expect(result).toHaveLength(4)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.minSkill).toBe(110)
      expect(result[0]?.maxSkill).toBe(110)
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.minSkill).toBe(125)
      expect(result[2]?.band).toBe('orange')
      expect(result[2]?.minSkill).toBe(150)
      expect(result[3]?.band).toBe('red')
      expect(result[3]?.minSkill).toBe(175)
    })

    test('5 distinct values: remainder 1 goes to green', () => {
      // 5 / 4 = 1, remainder 1
      // green: 2 values, yellow/orange/red: 1 value each
      const skills = [110, 125, 150, 175, 200]
      const result = computeDistinctSkillBands(skills, baselineSkill)

      expect(result).toHaveLength(4)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.minSkill).toBe(110)
      expect(result[0]?.maxSkill).toBe(125) // 2 values: 110, 125
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.minSkill).toBe(150)
      expect(result[2]?.band).toBe('orange')
      expect(result[2]?.minSkill).toBe(175)
      expect(result[3]?.band).toBe('red')
      expect(result[3]?.minSkill).toBe(200)
    })

    test('6 distinct values: remainder 2 goes to green and yellow', () => {
      // 6 / 4 = 1, remainder 2
      // green: 2 values, yellow: 2 values, orange/red: 1 value each
      const skills = [110, 125, 150, 175, 200, 225]
      const result = computeDistinctSkillBands(skills, baselineSkill)

      expect(result).toHaveLength(4)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.minSkill).toBe(110)
      expect(result[0]?.maxSkill).toBe(125) // 2 values
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.minSkill).toBe(150)
      expect(result[1]?.maxSkill).toBe(175) // 2 values
      expect(result[2]?.band).toBe('orange')
      expect(result[2]?.minSkill).toBe(200)
      expect(result[3]?.band).toBe('red')
      expect(result[3]?.minSkill).toBe(225)
    })

    test('7 distinct values: remainder 3 goes to green, yellow, orange', () => {
      // 7 / 4 = 1, remainder 3
      // green: 2 values, yellow: 2 values, orange: 2 values, red: 1 value
      const skills = [110, 125, 150, 175, 200, 225, 250]
      const result = computeDistinctSkillBands(skills, baselineSkill)

      expect(result).toHaveLength(4)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.minSkill).toBe(110)
      expect(result[0]?.maxSkill).toBe(125) // 2 values
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.minSkill).toBe(150)
      expect(result[1]?.maxSkill).toBe(175) // 2 values
      expect(result[2]?.band).toBe('orange')
      expect(result[2]?.minSkill).toBe(200)
      expect(result[2]?.maxSkill).toBe(225) // 2 values
      expect(result[3]?.band).toBe('red')
      expect(result[3]?.minSkill).toBe(250)
    })

    test('handles multiple agents per distinct value', () => {
      // Distinct values: 110, 125, 150, 175
      // 4 distinct values: 4 / 4 = 1, no remainder
      // Each band gets 1 distinct value
      // But multiple agents can have the same skill
      const skills = [110, 110, 110, 125, 125, 150, 150, 150, 150, 175]
      const result = computeDistinctSkillBands(skills, baselineSkill)

      expect(result).toHaveLength(4)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.count).toBe(3) // 3 agents with 110
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.count).toBe(2) // 2 agents with 125
      expect(result[2]?.band).toBe('orange')
      expect(result[2]?.count).toBe(4) // 4 agents with 150
      expect(result[3]?.band).toBe('red')
      expect(result[3]?.count).toBe(1) // 1 agent with 175
    })
  })

  describe('mixed skills above and below baseline', () => {
    test('filters out skills below baseline, includes baseline', () => {
      const skills = [50, 75, 100, 110, 125, 150]
      const result = computeDistinctSkillBands(skills, baselineSkill)

      // 100, 110, 125, 150 should be considered (4 distinct values)
      // Skills below baseline (50, 75) are filtered out
      expect(result).toHaveLength(4)
      expect(result[0]?.band).toBe('green')
      expect(result[0]?.minSkill).toBe(100)
      expect(result[1]?.band).toBe('yellow')
      expect(result[1]?.minSkill).toBe(110)
      expect(result[2]?.band).toBe('orange')
      expect(result[2]?.minSkill).toBe(125)
      expect(result[3]?.band).toBe('red')
      expect(result[3]?.minSkill).toBe(150)
    })
  })
})
