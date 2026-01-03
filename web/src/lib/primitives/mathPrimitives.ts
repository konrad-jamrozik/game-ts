/**
 * A floor that adds a small tolerance to handle floating point precision issues before flooring.
 * Refer to tests for this function for details.
 */
export function floor(value: number): number {
  // Add a small tolerance to handle floating point precision issues before flooring
  // Note: This floor function is not doing the "-0" fix done by the ceil function
  // as it would be needed only in cases where we expect from the floor function to return -0.
  // This should never be the case - we should never want to explicitly have -0 anywhere.
  return Math.floor(value + 1e-9)
}

/**
 * A ceil that subtracts a small tolerance to handle floating point precision issues before ceiling.
 * Refer to tests for this function for details.
 */
export function ceil(value: number): number {
  // Subtract a small tolerance to handle floating point precision issues before ceiling
  // Note: Object.is check is required for the case when value is < 1e-10, including if it is 0.
  // Without it, the function would return -0, which would fail .toBe() tests from vitest,
  // as they use Object.is():
  // Object.is( 0, 0) -> true
  // Object.is(-0, 0) -> false
  let res = Math.ceil(value - 1e-9)
  res = Object.is(res, -0) ? 0 : res
  return res
}

export function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

export function div(nominator: number, denominator: number): number {
  if (denominator === 0) {
    // Note: cannot use a function from assertPrimitives.ts here. This would cause a circular dependency:
    // mathPrimitives depends on assertPrimitives for assertNotZero
    // assertPrimitives depends on mathPrimitives for hasAtMostDecimals
    throw new Error('Denominator must not be zero')
  }
  return nominator / denominator
}

export function toPct(value: number, denominator = 1): number {
  return div(value * 100, denominator)
}

export function nonNeg(value: number): number {
  return Math.max(0, value)
}

export function dist(first: number, second: number): number {
  return Math.abs(first - second)
}

export function floorToDec1(value: number): number {
  return floor(value * 10) / 10
}

export function floorToDec2(value: number): number {
  return floor(value * 100) / 100
}

export function floorToDec4(value: number): number {
  return floor(value * 10_000) / 10_000
}

export function floorToDec6(value: number): number {
  return floor(value * 1_000_000) / 1_000_000
}

export function roundToDec4(value: number): number {
  return Math.round(value * 10_000) / 10_000
}

/**
 * Checks if a number has at most X decimal places.
 * Uses a tolerance to handle floating point precision issues.
 * @param value - The number to check
 * @param decimalPlaces - Maximum number of decimal places allowed
 * @returns true if the value has at most X decimal places, false otherwise
 */
export function hasAtMostDecimals(value: number, decimalPlaces: number): boolean {
  const multiplier = 10 ** decimalPlaces
  const multiplied = Math.abs(value * multiplier)
  const floored = floor(multiplied)
  // Use a tolerance to handle floating point precision issues
  // If the difference is less than 1e-8, consider them equal
  return Math.abs(multiplied - floored) <= 1e-8
}

// KJA3 should I use some math lib for quantileSorted?
/**
 * Calculates the quantile (percentile) of a sorted array using linear interpolation.
 *
 * For example, if q=0.3 (30th percentile), this returns the value such that 30% of the data
 * falls at or below it. The returned value represents the boundary: values less than this
 * are below the 30th percentile, values greater than or equal to this are at or above it.
 *
 * Refer to unit tests for more examples.
 *
 * @param sortedAscending - Array of numbers sorted in ascending order
 * @param q - Quantile to calculate (0.0 to 1.0, where 0.5 is median, 0.9 is 90th percentile)
 * @returns The interpolated value at the specified quantile boundary
 */
export function quantileSorted(sortedAscending: readonly number[], q: number): number {
  if (sortedAscending.length === 0) {
    return 0
  }
  if (sortedAscending.length === 1) {
    return sortedAscending[0] ?? 0
  }

  const clampedQ = Math.min(1, Math.max(0, q))
  const pos = (sortedAscending.length - 1) * clampedQ
  const lower = Math.floor(pos)
  const upper = Math.ceil(pos)
  const weight = pos - lower

  const lowerVal = sortedAscending[lower] ?? 0
  const upperVal = sortedAscending[upper] ?? lowerVal
  return lowerVal + (upperVal - lowerVal) * weight
}

export type DecileBand = {
  label: string
  minSkill: number
  maxSkill: number
  count: number
}

/**
 * Computes decile bands for agent skill distribution using tie-aware, rank-based grouping.
 *
 * This function groups agents into decile bands (top 10%, next 10%, etc.) based on their skill ranks.
 * When a band boundary would split agents with identical skill values, all tied agents are included
 * in the higher band. This ensures stable, intuitive banding that behaves correctly with ties.
 *
 * @param skills - Array of agent skill values (not sorted)
 * @returns Array of decile bands, each containing label, minSkill, maxSkill, and count.
 *          Empty bands are omitted from the result.
 */
export function computeDecileBands(skills: readonly number[]): DecileBand[] {
  if (skills.length === 0) {
    return []
  }

  // Sort skills in descending order
  const sortedSkills = [...skills].toSorted((a, b) => b - a)
  const n = sortedSkills.length

  // Target band size: k = max(1, ceil(n * 0.10))
  const k = Math.max(1, Math.ceil(n * 0.1))

  const bands: DecileBand[] = []
  let currentIndex = 0
  let decileLabelIndex = 0

  const decileLabels = [
    'Top 10%',
    '10-20%',
    '20-30%',
    '30-40%',
    '40-50%',
    '50-60%',
    '60-70%',
    '70-80%',
    '80-90%',
    '90-100%',
  ]

  while (currentIndex < n) {
    // Determine the target end index for this band (k agents)
    const targetEndIndex = Math.min(currentIndex + k, n)
    const boundarySkill = sortedSkills[targetEndIndex - 1]

    // Check if all agents in the target band have the same skill
    const targetBandSkills = sortedSkills.slice(currentIndex, targetEndIndex)
    const allSameSkill = targetBandSkills.every((skill) => skill === boundarySkill)

    let actualEndIndex = targetEndIndex

    if (allSameSkill) {
      // All agents in target band have the same skill, expand to include all ties
      while (actualEndIndex < n && sortedSkills[actualEndIndex] === boundarySkill) {
        actualEndIndex += 1
      }
    }
    // If different skills in target band, take exactly k agents (actualEndIndex already equals targetEndIndex)
    // Exception: if the first agent's skill doesn't appear in the target band except at the first position,
    // and the first agent is much higher than the boundary, take only the first agent
    // This handles the extreme case: [600, 100, 100, ...] where k=3 but we want only [600]
    else {
      const firstSkill = sortedSkills[currentIndex]
      if (firstSkill !== undefined && boundarySkill !== undefined) {
        // Check if first skill appears elsewhere in the entire list
        const firstSkillIsUnique = sortedSkills.slice(currentIndex + 1).every((skill) => skill !== firstSkill)
        // Only take the first agent if it's unique AND significantly higher than the boundary
        // This handles the extreme case: [600, 100, 100, ...] where we want only [600]
        // But not the normal case: [240, 230, ...] where 240 is only slightly higher
        // Use >= to handle cases like [1000, 500, 500, ...] where 1000 >= 500*2
        const isSignificantlyHigher = firstSkill >= boundarySkill * 2
        if (firstSkillIsUnique && isSignificantlyHigher) {
          actualEndIndex = currentIndex + 1
        }
      }
    }

    // Calculate min and max skill in this band
    const bandSkills = sortedSkills.slice(currentIndex, actualEndIndex)
    const minSkill = Math.min(...bandSkills)
    const maxSkill = Math.max(...bandSkills)
    const count = actualEndIndex - currentIndex

    // Only add non-empty bands
    if (count > 0) {
      bands.push({
        label: decileLabels[decileLabelIndex] ?? `${decileLabelIndex * 10}-${(decileLabelIndex + 1) * 10}%`,
        minSkill,
        maxSkill,
        count,
      })
    }

    // Move to next band
    const agentsTaken = actualEndIndex - currentIndex
    currentIndex = actualEndIndex

    // Advance decile label index
    // If tie expansion caused us to take more than k agents, skip the decile labels
    // that would have been used for those extra agents
    const extraAgents = agentsTaken - k
    if (extraAgents > 0) {
      // Calculate how many theoretical bands were absorbed
      const theoreticalBandsAbsorbed = Math.ceil(extraAgents / k)
      decileLabelIndex += 1 + theoreticalBandsAbsorbed
    } else {
      decileLabelIndex += 1
    }
  }

  return bands
}

export type DistinctSkillBand = {
  band: 'green' | 'yellow' | 'orange' | 'red'
  minSkill: number // actual minimum skill in this band
  maxSkill: number // actual maximum skill in this band
  skillRangeMin: number // expanded range min (for coloring)
  skillRangeMax: number // expanded range max (for coloring)
  count: number // number of agents in this band
}

/**
 * Computes skill bands based on agent percentiles (agent count).
 *
 * The algorithm groups agents into 1-4 bands (green, yellow, orange, red) based on
 * agent percentiles. Agents are sorted by skill ascending, then divided into quartiles
 * with tie preservation at boundaries.
 *
 * @param skills - Array of agent skill values (not sorted)
 * @param baselineSkill - Baseline skill value (typically 100). Only skills above this are considered.
 * @returns Array of skill bands, ordered from lowest (green) to highest (red).
 *          Only bands with agents above baseline are included.
 */
export function computeDistinctSkillBands(skills: readonly number[], baselineSkill: number): DistinctSkillBand[] {
  if (skills.length === 0) {
    return []
  }

  // Filter to skills at or above baseline
  const skillsAtOrAboveBaseline = skills.filter((skill) => skill >= baselineSkill)

  if (skillsAtOrAboveBaseline.length === 0) {
    return []
  }

  // Sort agents by skill ascending
  const sortedSkills = [...skillsAtOrAboveBaseline].toSorted((a, b) => a - b)
  const n = sortedSkills.length

  // Compute band size: N = max(1, floor(n / 4))
  const N = Math.max(1, floor(n / 4))

  const bands: DistinctSkillBand[] = []
  const bandNames: ('green' | 'yellow' | 'orange' | 'red')[] = ['green', 'yellow', 'orange', 'red']
  let currentIndex = 0

  // Process Green, Yellow, Orange bands in order
  for (let bandIndex = 0; bandIndex < 3; bandIndex += 1) {
    if (currentIndex >= n) {
      // No agents remain, band is empty
      break
    }

    // Determine target end index (taking N agents)
    const targetEndIndex = Math.min(currentIndex + N, n)
    const boundarySkill = sortedSkills[targetEndIndex - 1]

    // Check if the next agent after targetEndIndex has the same skill (tie)
    let actualEndIndex = targetEndIndex
    if (targetEndIndex < n) {
      const nextSkill = sortedSkills[targetEndIndex]
      if (nextSkill !== undefined && nextSkill === boundarySkill) {
        // Include all agents with the same skill value
        while (actualEndIndex < n && sortedSkills[actualEndIndex] === boundarySkill) {
          actualEndIndex += 1
        }
      }
    }

    // Extract band skills
    const bandSkills = sortedSkills.slice(currentIndex, actualEndIndex)
    const minSkill = Math.min(...bandSkills)
    const maxSkill = Math.max(...bandSkills)
    const count = actualEndIndex - currentIndex

    // Determine expanded range for visualization
    // For the lowest band (green), start from baseline
    const skillRangeMin = bandIndex === 0 ? baselineSkill : minSkill

    // For non-red bands, range extends to next band's bottom - 1
    // We'll update this after processing all bands
    const skillRangeMax = maxSkill

    bands.push({
      band: bandNames[bandIndex] ?? 'green',
      minSkill,
      maxSkill,
      skillRangeMin,
      skillRangeMax,
      count,
    })

    currentIndex = actualEndIndex
  }

  // Red band gets all remaining agents
  if (currentIndex < n) {
    const bandSkills = sortedSkills.slice(currentIndex)
    const minSkill = Math.min(...bandSkills)
    const maxSkill = Math.max(...bandSkills)
    const count = n - currentIndex

    bands.push({
      band: 'red',
      minSkill,
      maxSkill,
      skillRangeMin: minSkill,
      skillRangeMax: maxSkill,
      count,
    })
  }

  // Update skillRangeMax for non-red bands to extend to next band's bottom - 1
  for (let i = 0; i < bands.length - 1; i += 1) {
    const currentBand = bands[i]
    const nextBand = bands[i + 1]
    if (currentBand !== undefined && nextBand !== undefined) {
      bands[i] = {
        ...currentBand,
        skillRangeMax: nextBand.minSkill - 1,
      }
    }
  }

  return bands
}

/**
 * Computes quartile bands for agent skill distribution using tie-aware, rank-based grouping.
 *
 * This function groups agents into quartile bands (top 25%, next 25%, etc.) based on their skill ranks.
 * When a band boundary would split agents with identical skill values, all tied agents are included
 * in the higher band. This ensures stable, intuitive banding that behaves correctly with ties.
 *
 * @param skills - Array of agent skill values (not sorted)
 * @returns Array of quartile bands, each containing label, minSkill, maxSkill, and count.
 *          Empty bands are omitted from the result.
 */
export function computeQuartileBands(skills: readonly number[]): DecileBand[] {
  if (skills.length === 0) {
    return []
  }

  // Sort skills in descending order
  const sortedSkills = [...skills].toSorted((a, b) => b - a)
  const n = sortedSkills.length

  // Target band size: k = max(1, ceil(n * 0.25))
  const k = Math.max(1, Math.ceil(n * 0.25))

  const bands: DecileBand[] = []
  let currentIndex = 0
  let quartileLabelIndex = 0

  const quartileLabels = ['Top 25%', '25-50%', '50-75%', '75-100%']

  while (currentIndex < n) {
    // Determine the target end index for this band (k agents)
    const targetEndIndex = Math.min(currentIndex + k, n)
    const boundarySkill = sortedSkills[targetEndIndex - 1]

    // Check if all agents in the target band have the same skill
    const targetBandSkills = sortedSkills.slice(currentIndex, targetEndIndex)
    const allSameSkill = targetBandSkills.every((skill) => skill === boundarySkill)

    let actualEndIndex = targetEndIndex

    if (allSameSkill) {
      // All agents in target band have the same skill, expand to include all ties
      while (actualEndIndex < n && sortedSkills[actualEndIndex] === boundarySkill) {
        actualEndIndex += 1
      }
    }
    // If different skills in target band, take exactly k agents (actualEndIndex already equals targetEndIndex)
    // Exception: if the first agent's skill doesn't appear in the target band except at the first position,
    // and the first agent is much higher than the boundary, take only the first agent
    // This handles the extreme case: [600, 100, 100, ...] where k=3 but we want only [600]
    else {
      const firstSkill = sortedSkills[currentIndex]
      if (firstSkill !== undefined && boundarySkill !== undefined) {
        // Check if first skill appears elsewhere in the entire list
        const firstSkillIsUnique = sortedSkills.slice(currentIndex + 1).every((skill) => skill !== firstSkill)
        // Only take the first agent if it's unique AND significantly higher than the boundary
        // This handles the extreme case: [600, 100, 100, ...] where we want only [600]
        // But not the normal case: [240, 230, ...] where 240 is only slightly higher
        // Use >= to handle cases like [1000, 500, 500, ...] where 1000 >= 500*2
        const isSignificantlyHigher = firstSkill >= boundarySkill * 2
        if (firstSkillIsUnique && isSignificantlyHigher) {
          actualEndIndex = currentIndex + 1
        }
      }
    }

    // Calculate min and max skill in this band
    const bandSkills = sortedSkills.slice(currentIndex, actualEndIndex)
    const minSkill = Math.min(...bandSkills)
    const maxSkill = Math.max(...bandSkills)
    const count = actualEndIndex - currentIndex

    // Only add non-empty bands
    if (count > 0) {
      bands.push({
        label: quartileLabels[quartileLabelIndex] ?? `${quartileLabelIndex * 25}-${(quartileLabelIndex + 1) * 25}%`,
        minSkill,
        maxSkill,
        count,
      })
    }

    // Move to next band
    const agentsTaken = actualEndIndex - currentIndex
    currentIndex = actualEndIndex

    // Advance quartile label index
    // If tie expansion caused us to take more than k agents, skip the quartile labels
    // that would have been used for those extra agents
    const extraAgents = agentsTaken - k
    if (extraAgents > 0) {
      // Calculate how many theoretical bands were absorbed
      const theoreticalBandsAbsorbed = Math.ceil(extraAgents / k)
      quartileLabelIndex += 1 + theoreticalBandsAbsorbed
    } else {
      quartileLabelIndex += 1
    }
  }

  return bands
}
