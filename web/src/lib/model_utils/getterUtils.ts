import { fmtNoPrefix } from '../primitives/formatPrimitives'
import type { FactionId } from '../model/modelIds'

export function getFactionShortId(factionId: FactionId): string {
  return fmtNoPrefix(factionId, 'faction-')
}
