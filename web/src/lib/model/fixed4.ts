import { assertMax4Dec } from '../utils/assert'
import { fmtPctDec2 } from '../utils/formatUtils'
import { floor } from '../utils/mathUtils'
import { bps, type Bps } from './bps'

export function toF4(value: number): Bps {
  assertMax4Dec(value)
  return floorToF4(value)
}

export function f4fmtPctDec2(nominator: Bps): string {
  return fmtPctDec2(f4asFloat(nominator))
}

function f4asFloat(fixed: Bps): number {
  return fixed.value / 10_000
}

function floorToF4(value: number): Bps {
  return bps(floor(value * 10_000))
}

export function f4sub(first: Bps, second: Bps): Bps {
  return bps(first.value - second.value)
}
