import { assertNotZero } from './assert'

/**
 * A floor that adds a small tolerance to handle floating point precision issues before flooring.
 *
 * For example, Math.floor(100 * 0.2) would result in Math.floor(19.999999999999996) == 19, instead of 20.
 *
 */
export function floor(value: number): number {
  // Add a small tolerance (1e-8) to handle floating point precision issues before flooring
  return Math.floor(value + 1e-8)
}

/**
 * A ceil that subtracts a small tolerance to handle floating point precision issues before ceiling.
 *
 * For example, Math.ceil(100 * 0.2) might result in Math.ceil(20.000000000000004) == 21, instead of 20.
 *
 */
export function ceil(value: number): number {
  // Subtract a small tolerance (1e-8) to handle floating point precision issues before ceiling
  // Note: Object.is check is required for the case when value is < 1e-10, including if it is 0.
  // Without it, the function would return -0, which would fail .toBe() tests from vitest,
  // as they use Object.is():
  // Object.is( 0, 0) -> true
  // Object.is(-0, 0) -> false
  let res = Math.ceil(value - 1e-8)
  res = Object.is(res, -0) ? 0 : res
  return res
}

export function div(nominator: number, denominator: number): number {
  assertNotZero(denominator)
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
