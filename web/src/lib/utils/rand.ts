/**
 * A random number generator that can return fixed values for labeled random calls.
 */

import { assertDefined, assertInRange } from './assert'

function newRand(): {
  readonly get: (label?: string) => number
  readonly set: (label: string, value: number) => void
  readonly reset: () => void
} {
  const overrides = new Map<string, number>()

  return {
    get(label?: string): number {
      if (label !== undefined && overrides.has(label)) {
        const value = overrides.get(label)
        assertDefined(value)
        return value
      }
      return Math.random()
    },

    set(label: string, value: number): void {
      assertInRange(value, 0, 1)
      // Setting injected value of 1 to 0.(9) because Math.random() returns values strictly less than 1.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#return_value
      const adjustedValue = value === 1 ? 0.999_999_999_999_999 : value
      overrides.set(label, adjustedValue)
    },

    reset(): void {
      overrides.clear()
    },
  } as const
}

export const rand = newRand()
