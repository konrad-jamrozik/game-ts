/**
 * Controllable random system for deterministic testing.
 * Allows setting specific return values for labeled random calls while
 * falling back to Math.random() for unlabeled calls.
 */

import { assertDefined } from './assert'

type RandomProvider = {
  get(label?: string): number
  set(label: string, value: number): void
  reset(): void
}

class ControllableRandom implements RandomProvider {
  private readonly overrides = new Map<string, number>()

  public get(label?: string): number {
    if (label !== undefined && this.overrides.has(label)) {
      const value = this.overrides.get(label)
      assertDefined(value)
      return value
    }
    return Math.random()
  }

  public set(label: string, value: number): void {
    if (value < 0 || value > 1) {
      throw new Error(`Random value must be between 0 and 1, got: ${value}`)
    }
    // Setting 1 to 0.(9) because Math.random() returns values strictly less than 1.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#return_value
    const adjustedValue = value === 1 ? 0.999_999_999 : value
    this.overrides.set(label, adjustedValue)
  }

  public reset(): void {
    this.overrides.clear()
  }
}

export const rand = new ControllableRandom()
