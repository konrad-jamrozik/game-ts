import { isBps, type Bps } from '../model/bps'
import { isF2, type Fixed2 } from '../model/fixed2'
import { assertNotZero } from './assert'

/**
 * A floor that adds a small tolerance to handle floating point precision issues before flooring.
 *
 * For example, Math.floor(100 * 0.2) would result in Math.floor(19.999999999999996) == 19, instead of 20.
 *
 */
export function floor(value: number): number {
  // Add a small tolerance (1e-10) to handle floating point precision issues before flooring
  return Math.floor(value + 1e-10)
}

/**
 * A ceil that subtracts a small tolerance to handle floating point precision issues before ceiling.
 *
 * For example, Math.ceil(100 * 0.2) might result in Math.ceil(20.000000000000004) == 21, instead of 20.
 *
 */
export function ceil(value: number): number {
  // Subtract a small tolerance (1e-10) to handle floating point precision issues before ceiling
  // Note: Math.abs is required for the case when value is < 1e-10, including if it is 0.
  // Without abs, the function would return -0, which would fail .toBe() tests from vitest,
  // as they use Object.is():
  // Object.is( 0, 0) -> true
  // Object.is(-0, 0) -> false
  return Math.abs(Math.ceil(value - 1e-10))
}

/** // KJA get rid of multAndFloor
 * Multiplies given value by given precision, then rounds down the result to nearest integer.
 *
 * For example:
 * multAndFloor(0.1278,     100) ->   12
 * multAndFloor(0.009,   10_000) ->   90
 * multAndFloor(0.12348, 10_000) -> 1234
 * multAndFloor(0.99999, 10_000) -> 9999
 *
 * @param value - The value to round
 * @param precision - The precision to round to
 * @returns The rounded value
 */
export function multAndFloor(value: number, precision: number): number {
  return floor(value * precision)
}

// KJA2 get rid of this
export function divMult100Round(nominator: number, denominator: number): number {
  return Math.round(div(nominator, denominator) * 100)
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

export function val(value: number | Bps | Fixed2): number {
  return isBps(value) || isF2(value) ? value.value : value
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
