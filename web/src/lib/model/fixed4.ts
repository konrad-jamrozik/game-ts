import { fmtPctDec2 } from '../utils/formatUtils'
import type { Bps } from './bps'

export function f4fmtPctDec2(nominator: Bps): string {
  return fmtPctDec2(f4asFloat(nominator))
}

function f4asFloat(fixed: Bps): number {
  return fixed.value / 10_000
}
